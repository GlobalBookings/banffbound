/** Paragraph repair only. These dates do not mark a full guide/source review. */
export const legacyTextCorrectionDate = '2026-10-29';
export interface LegacyTextCorrection {
  correctedAt: string;
  paragraph: string;
  summary: string;
}
export const legacyTextCorrections: Record<string, LegacyTextCorrection> = {
  'nightclub-banff': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested venue/title chain and personal-visit claim with evening-format and return-journey planning.' },
  'banff-nightclubs': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested activity/title chain and training claim with event, entry and transport checks.' },
  'new-places-to-eat-in-banff': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested dining/title chain and personal-experience claim with dated-opening, menu and reservation checks.' },
  'banff-clubs': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested restaurant/nightlife chain and personal-visit claim with evening-format and admission planning.' },
  'banff-bars': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested viewpoint/nightlife chain with bar-format and return-journey planning.' },
  'golden-banff': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested restaurant/ski-title chain and personal-experience claim; distinguished Banff scenery planning from the separate Golden base.' },
  'jasper-town': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested road-trip/title chain and personal-experience claim with town, park and travel-day planning.' },
  'jasper-national-park': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested Jasper/title chain and personal-experience claim with road-journey and park-access planning.' },
  'deals-in-banff': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested climbing/wildlife chain and personal-experience claim with complete quote and inclusion comparisons.' },
  'johnsons-canyon': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested typo-guide chain and personal-visit claim with endpoint planning and links to reviewed canyon resources.' },
  'calgary-to-jasper': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested weather/road-trip chain and personal-experience claim with transfer, travel-day and overnight planning.' },
  'numtijah-lodge': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested lodge-title chain with current operator, season and room checks, distinct from a Bow Lake day visit.' },
  'num-ti-jah-lodge': { correctedAt: legacyTextCorrectionDate, paragraph: 'opening paragraph', summary: 'Replaced the nested lodge-title chain with current identity and operation checks; a historical name does not establish availability.' },
};
