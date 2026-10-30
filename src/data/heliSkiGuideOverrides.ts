import {heliSkiPlannerHtml,heliSkiPlanningFaqHtml,heliSkiReviewedAt,heliSkiSources} from './heliSkiPlanning';

/** Full refresh of an already-reviewed canonical; original publication stays 2025-11-06. */
export const heliSkiGuideOverrides: Record<string,string> = {
  'banff-heli-skiing': `
<p><strong>The two heli-ski programmes compared here operate from Golden and Panorama in British Columbia.</strong> They are guided backcountry ski and snowboard days, with a journey from your Banff-area stay to the operator’s staging point. Start by discussing the party’s actual ability with the operator, then choose the programme, transport and overnight plan together.</p>
<p><strong>Full guide reviewed October 29, 2026.</strong> Use the comparison below to turn an idea into a useful enquiry: the actual programme, meeting point, equipment, meals, complete quote and return. For a sightseeing ride without skiing, use the separate <a href="/blog/banff-helicopter-tours/">scenic helicopter guide</a>.</p>
<nav aria-label="Heli-ski guide sections"><p><a href="#operators">Choose the journey</a> · <a href="#ability">Discuss ability</a> · <a href="#heli-ski-planner">Build the logistics questions</a> · <a href="#cost">Compare the quote</a> · <a href="#day">Prepare the day</a> · <a href="#cancellation">Read the terms</a> · <a href="#heli-ski-faq-title">Questions</a></p></nav>

<h2 id="operators">Golden or Panorama: choose the whole journey</h2>
<p><a href="${heliSkiSources.purcell}" target="_blank" rel="noopener">CMH Purcell</a> is based in Golden, with a self-drive arrangement and no included overnight accommodation. <a href="${heliSkiSources.rkArrival}" target="_blank" rel="noopener">RK Heliski</a> is based in Panorama and publishes separately priced transfer enquiries from Banff and Lake Louise. The two starting points lead to different road journeys and overnight choices.</p>
<p>Choose the actual ski programme before making dependent hotel or transport purchases. For Purcell, compare a Golden-area stay with the complete staging journey. For RK, compare staying near Panorama with a confirmed transfer or self-drive plan. An area name alone does not identify the hotel-to-meeting-point leg; get the check-in time, time zone and return arrangements in writing.</p>

<h2 id="ability">Describe your experience before paying a deposit</h2>
<p>Tell the operator about recent untracked snow, variable crust, trees, maintaining control when tired and getting up after a fall in deeper snow. Explain the pace and experience of each person who wants to ski together. CMH’s <a href="${heliSkiSources.purcell}" target="_blank" rel="noopener">Purcell descriptions</a> discuss continuous skiing or riding in challenging snow and treed terrain; RK’s <a href="${heliSkiSources.rkFaq}" target="_blank" rel="noopener">programme FAQ</a> links its ability assessment and grouping information. Ask which exact programme, if any, fits the group.</p>
<ul><li><strong>Learning turns:</strong> use the <a href="/learn-to-ski/#lesson-fit">first-lesson finder</a> for a resort introduction.</li><li><strong>Comfortable on groomers but new to off-piste snow:</strong> discuss a resort-based powder lesson with a qualified instructor before choosing a heli day.</li><li><strong>Experienced in variable snow:</strong> give the operator a current account of the party’s skills, pace and fitness, rather than relying on a resort colour grade.</li><li><strong>Mixed abilities:</strong> resolve grouping and the programme before assuming everyone can stay together.</li></ul>
<p>A first heli-ski day introduces helicopter-accessed skiing; it is not a first ski lesson. For self-powered backcountry travel, use the separate <a href="/blog/banff-ski-touring/">touring readiness guide</a>. The logistics choices below do not assess either activity’s terrain or ability requirements.</p>

${heliSkiPlannerHtml}

<h2 id="cost">Compare the complete written quote</h2>
<p>Ask for a quote for the actual party, date and programme. CMH’s <a href="${heliSkiSources.cmhVertical}" target="_blank" rel="noopener">included vertical and refund definitions</a> and RK’s <a href="${heliSkiSources.rkTerms}" target="_blank" rel="noopener">run-based and private-package terms</a> describe different ways of structuring a day. Compare the stated inclusion and what changes the total, rather than treating “vertical”, a run allowance and a private booking as the same purchase.</p>
<ul><li><strong>Ski programme:</strong> format, taxes, included skiing, any extra charges and the applicable terms.</li><li><strong>Equipment:</strong> own boots, requested skis or board and compatibility, helmet arrangements, safety pack and training.</li><li><strong>Food:</strong> the selected booking’s actual meal and dietary arrangements, including the Purcell source conflict identified in its card.</li><li><strong>Journey and stay:</strong> transfer or vehicle costs, the staging leg, accommodation and the full return.</li><li><strong>Confirmation:</strong> payment timing, what confirms the place, required waivers and how to contact the operator if plans change.</li></ul>
<p>The <a href="/ski-pass-calculator/">resort ski-pass calculator</a> is useful for the other ski days in the holiday. A resort pass comparison does not include or reserve a heli-ski programme.</p>

<h2 id="day">Prepare the ski day and the journey home</h2>
<ol><li><strong>Before travelling:</strong> check operator messages, the actual staging address, road reports and the required arrival instructions. Pack boots, layers, gloves and eye protection; confirm the equipment request and any separate overnight bag.</li><li><strong>At check-in:</strong> allow for waivers, fitting and the complete avalanche-equipment and helicopter briefing. Follow the operator’s process even if you have heli-skied before.</li><li><strong>During the day:</strong> follow the guide’s grouping, spacing and stopping instructions. Raise fatigue or equipment problems early, and discuss a change of plan with the guide.</li><li><strong>After skiing:</strong> use the confirmed pickup or assess the real return journey. Keep the evening flexible and retain an overnight option if the original plan no longer fits.</li></ol>
<p>Use <a href="/blog/banff-winter-driving/">winter driving preparation</a> and <a href="/conditions/">the current road-source handoff</a> for the route. The operator’s flight decision and the road from your accommodation are separate checks.</p>

<h2 id="cancellation">Read guest cancellation, no-fly and transfer terms separately</h2>
<p>Resolve three cases before paying: <strong>you cannot attend or reach check-in</strong>; <strong>the operator cannot start the day</strong>; and <strong>the day starts but less skiing is completed</strong>. Ask which provisions apply to your exact programme and sales channel, and what happens to any separately booked transfer or hotel. Keep the written terms with the confirmation.</p>
<p>RK’s published transport exclusion and its ski-package provisions are distinct, as the comparison explains. For CMH, identify the relevant season and programme section rather than transferring a lodge or private-trip rule to every Purcell day booking. If arranging insurance, check that the actual guided activity, cancellation and interruption circumstances are covered under the policy you choose; an operator booking does not establish that cover.</p>

<h2 id="heli-rest-of-trip">Put the heli day into the rest of the holiday</h2>
<p>Use the <a href="/towns/golden/">Golden base guide</a> and <a href="/towns/">town comparison</a> to separate the staging journey from the rest of the stay. You can compare <a href="https://www.expedia.ca/Hotel-Search?destination=Golden%2C+British+Columbia&amp;camref=1101l3MtWX" target="_blank" rel="noopener sponsored">Golden accommodation on Expedia</a>; this is an affiliate link, and BanffBound may earn a commission. It is an accommodation search, not a heli-ski package or a verified room offer.</p>
<p>For the Banff-area portion, compare <a href="/winter-stays/">winter accommodation</a>, <a href="/towns/banff/">Banff</a> and <a href="/towns/lake-louise/">Lake Louise</a>, then build separate resort days with the <a href="/ski-day-planner/">ski day planner</a>. Keep a flexible alternative from <a href="/winter/">the winter guide</a> or <a href="/what-to-do-today/">the day-choice tool</a> if the heli plan changes. Cat-skiing and scenic flights need their own operator arrangements; neither is automatically supplied as a replacement.</p>

${heliSkiPlanningFaqHtml}

<h2 id="heli-guide-sources">Sources and review</h2>
<p><strong>Full guide reviewed October 29, 2026.</strong> The comparison links current CMH Purcell and RK programme, arrival, equipment, booking and cancellation sources, plus the dated limits of KPOW’s published cat-ski information. Operator links are direct information or enquiry routes. The chooser records public planning preferences; the operator confirms the programme and day’s operation. The retained hero photograph is illustrative, not a verified image of either operator, terrain or current snow.</p>
`,
};

export const heliSkiGuideMetadata: Record<string,{title:string;description:string;lastUpdated:string;readTime:string;imageIsIllustrative:boolean;imageNote:string}> = {
  'banff-heli-skiing': {
    title:'Heli-Skiing Near Banff: Operators, Transfers & Trip Planner',
    description:'Compare CMH Purcell and RK Heliski bases, transport, equipment and booking terms, then build logistics questions and a public enquiry outline for your heli-ski trip.',
    lastUpdated:heliSkiReviewedAt,
    readTime:'12 min read',
    imageIsIllustrative:true,
    imageNote:'Illustrative photograph; not a verified image of CMH Purcell, RK Heliski, their terrain or current snow conditions.',
  },
};
