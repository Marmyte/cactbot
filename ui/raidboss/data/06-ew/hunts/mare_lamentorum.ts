import NetRegexes from '../../../../../resources/netregexes';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.MareLamentorum,
  triggers: [
    {
      id: 'Hunt Lunatender Queen Away With You',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AE5', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Lunatender Queen Away With You Whim',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AEB', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.getUnder(),
    },
    {
      id: 'Hunt Lunatender Queen You May Approach',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AE4', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.getUnder(),
    },
    {
      id: 'Hunt Lunatender Queen You May Approach Whim',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AEA', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.getOut(),
    },
    {
      id: 'Hunt Lunatender Queen Avert Your Eyes',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AE3', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.lookAway(),
    },
    {
      id: 'Hunt Lunatender Queen Avert Your Eyes Whim',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AE9', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.lookTowards(),
    },
    {
      id: 'Hunt Lunatender Queen 999,000 Needles',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AE6', source: 'Lunatender Queen', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.outOfMelee(),
    },
    {
      id: 'Hunt Mousse Princess Rightward Whimsy',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'B18', source: 'Mousse Princess', capture: false }),
      condition: (data) => data.inCombat,
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Right Flank',
          de: 'Weg von der rechten Flanke',
          fr: '??loignez-vous du flanc droit',
          cn: '????????????',
          ko: '?????? ????????? ?????????',
        },
      },
    },
    {
      id: 'Hunt Mousse Princess Backward Whimsy',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'B1A', source: 'Mousse Princess', capture: false }),
      condition: (data) => data.inCombat,
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Back',
          de: 'Weg von hinter ihr',
          fr: '??loignez-vous de l\'arri??re',
          cn: '????????????',
          ko: '?????? ??? ?????????',
        },
      },
    },
    {
      id: 'Hunt Mousse Princess Leftward Whimsy',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'B19', source: 'Mousse Princess', capture: false }),
      condition: (data) => data.inCombat,
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Left Flank',
          de: 'Weg von der linker Flanke',
          fr: '??loignez-vous du flanc gauche',
          cn: '????????????',
          ko: '?????? ?????? ?????????',
        },
      },
    },
    {
      id: 'Hunt Mousse Princess Forward Whimsy',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'B8E', source: 'Mousse Princess', capture: false }),
      condition: (data) => data.inCombat,
      durationSeconds: 6,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Front',
          de: 'Weg von Vorne',
          fr: '??loignez-vous du devant',
          cn: '????????????',
          ko: '?????? ??? ?????????',
        },
      },
    },
    {
      id: 'Hunt Mousse Princess Banish',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6ABB', source: 'Mousse Princess' }),
      condition: (data) => data.inCombat,
      // Doesn't cleave (I think?).
      response: Responses.tankBuster('info'),
    },
    {
      id: 'Hunt Mousse Princess Amorphic Flail',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6AB9', source: 'Mousse Princess', capture: false }),
      condition: (data) => data.inCombat,
      response: Responses.outOfMelee(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Lunatender Queen': 'Lunatender-K??nigin',
        'Mousse Princess': 'Mousse-Prinzessin',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Lunatender Queen': 'pampa s??l??nienne reine',
        'Mousse Princess': 'princesse mousse',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Lunatender Queen': '?????????????????????????????????',
        'Mousse Princess': '????????????????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Lunatender Queen': '?????????????????????',
        'Mousse Princess': '????????????',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Lunatender Queen': '???????????? ??????',
        'Mousse Princess': '?????? ??????',
      },
    },
  ],
};

export default triggerSet;
