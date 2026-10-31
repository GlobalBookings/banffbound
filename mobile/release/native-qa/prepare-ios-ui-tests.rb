#!/usr/bin/env ruby
# Only edits the ephemeral `expo prebuild` project on the CI runner.
require 'fileutils'
require 'json'
require 'xcodeproj'

mobile = File.expand_path('../..', __dir__)
ios = File.join(mobile, 'ios')
projects = Dir[File.join(ios, '*.xcodeproj')]
abort 'Expected exactly one generated app project' unless projects.length == 1
project_path = projects.first
project = Xcodeproj::Project.open(project_path)
app_targets = project.targets.select { |target| target.product_type == 'com.apple.product-type.application' }
abort 'Expected exactly one application target' unless app_targets.length == 1
app = app_targets.first
name = 'BanffBoundUITests'
abort 'UI test target already exists; start from a clean generated project' if project.targets.any? { |target| target.name == name }

test = project.new_target(:ui_test_bundle, name, :ios, '16.4')
test.add_dependency(app)
group = project.main_group.new_group(name, name)
FileUtils.mkdir_p(File.join(ios, name))
FileUtils.cp(File.join(__dir__, "#{name}.swift"), File.join(ios, name, "#{name}.swift"))
test.add_file_references([group.new_file("#{name}.swift")])
test.build_configurations.each do |configuration|
  configuration.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => 'com.banffbound.app.simulatoruitests',
    'PRODUCT_NAME' => '$(TARGET_NAME)',
    'SWIFT_VERSION' => '5.0',
    'IPHONEOS_DEPLOYMENT_TARGET' => '16.4',
    'TARGETED_DEVICE_FAMILY' => '1,2',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'TEST_TARGET_NAME' => app.name,
    'CODE_SIGNING_ALLOWED' => 'NO',
    'CODE_SIGNING_REQUIRED' => 'NO',
    'CLANG_ENABLE_MODULES' => 'YES',
    'FRAMEWORK_SEARCH_PATHS' => ['$(inherited)', '$(PLATFORM_DIR)/Developer/Library/Frameworks', '$(SDKROOT)/Developer/Library/Frameworks'],
    'LD_RUNPATH_SEARCH_PATHS' => ['$(inherited)', '@executable_path/Frameworks', '@loader_path/Frameworks'],
    'SWIFT_EMIT_LOC_STRINGS' => 'NO'
  )
  configuration.build_settings.delete('TEST_HOST')
  configuration.build_settings.delete('BUNDLE_LOADER')
end
project.root_object.attributes['TargetAttributes'] ||= {}
project.root_object.attributes['TargetAttributes'][test.uuid] = {
  'CreatedOnToolsVersion' => '26.6', 'TestTargetID' => app.uuid
}
project.save

# Create an isolated shared scheme; the template's stale HelloWorldTests is never used.
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(app)
scheme.add_build_target(test, false)
scheme.add_test_target(test)
scheme.set_launch_target(app)
scheme.test_action.build_configuration = 'Release'
scheme.launch_action.build_configuration = 'Release'
scheme.save_as(project_path, 'BanffBoundNativeQA')
workspaces = Dir[File.join(ios, '*.xcworkspace')]
abort 'Expected exactly one CocoaPods workspace' unless workspaces.length == 1
File.write(File.join(ENV.fetch('QA_ROOT'), 'project.json'), JSON.pretty_generate({
  workspace: workspaces.first, project: project_path, scheme: 'BanffBoundNativeQA',
  application_target: app.name, test_target: test.name,
  configuration: 'Release', signing: false
}) + "\n")
puts "Prepared #{test.name} against #{app.name}; no app sources or settings changed."
