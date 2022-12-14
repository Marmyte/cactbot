import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Intemperance calls out a 4th time; should only call out three
// TODO: Right/Left + Fire/Light happen at the same time later; collect these together

export type Data = RaidbossData;

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.AsphodelosTheFirstCircle,
  timelineFile: 'p1n.txt',
  triggers: [
    {
      // Also happens during Aetherflail Right (65DF)
      id: 'P1N Gaoler\'s Flail Right',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6DA2', source: 'Erichthonios', capture: false }),
      response: Responses.goLeft(),
    },
    {
      // Also happens during Aetherflail Left (65E0)
      id: 'P1N Gaoler\'s Flail Left',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6DA3', source: 'Erichthonios', capture: false }),
      response: Responses.goRight(),
    },
    {
      id: 'P1N Warder\'s Wrath',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '65F4', source: 'Erichthonios', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'P1N Shining Cells',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '65E9', source: 'Erichthonios', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'P1N Slam Shut',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '65EA', source: 'Erichthonios', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'P1N Pitiless Flail KB',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ id: '0001' }),
      condition: Conditions.targetIsYou(),
      response: Responses.knockback(),
    },
    {
      id: 'P1N Pitiless Flail Stack',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ id: '003E', capture: false }),
      response: Responses.stackMarker(),
    },
    {
      id: 'P1N Intemperance',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: ['AB3', 'AB4'], capture: true }),
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => {
        return _matches.effectId === 'AB3' ? output.red!() : output.blue!();
      },
      outputStrings: {
        red: {
          en: 'Get hit by red',
          de: 'Von Rot treffen lassen',
          fr: 'Faites-vous toucher par le rouge',
          ja: '???????????????',
          cn: '?????????',
          ko: '????????? ??????',
        },
        blue: {
          en: 'Get hit by blue',
          de: 'Von Blau treffen lassen',
          fr: 'Faites-vous toucher par le bleu',
          ja: '???????????????',
          cn: '?????????',
          ko: '????????? ??????',
        },
      },
    },
    {
      id: 'P1N Heavy Hand',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '65F3', source: 'Erichthonios' }),
      condition: Conditions.caresAboutPhysical(),
      response: Responses.tankBuster(),
    },
    {
      id: 'P1N Powerful Light',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: '893', capture: true }),
      alertText: (_data, matches, output) => {
        if (matches.count === '14C')
          return output.light!();
        return output.fire!();
      },
      outputStrings: {
        fire: {
          en: 'Stand on fire',
          de: 'Auf der Feuerfl??che stehen',
          fr: 'Placez-vous sur le feu',
          ja: '????????????',
          cn: '?????????',
          ko: '????????? ?????? ?????? ??????',
        },
        light: {
          en: 'Stand on light',
          de: 'Auf der Lichtfl??che stehen',
          fr: 'Placez-vous sur la lumi??re',
          ja: '????????????',
          cn: '?????????',
          ko: '?????? ?????? ?????? ??????',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Gaoler\'s Flail Left/Gaoler\'s Flail Right': 'Gaoler\'s Flail Left/Right',
        'Gaoler\'s Flail Right/Gaoler\'s Flail Left': 'Gaoler\'s Flail Right/Left',
        'Hot Spell/Cold Spell': 'Hot/Cold Spell',
        'Powerful Fire/Powerful Light': 'Powerful Fire/Light',
        'Aetherflail Left/Aetherflail Right': 'Aetherflail Left/Right',
        'Aetherflail Right/Aetherflail Left': 'Aetherflail Right/Left',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Erichthonios': 'Erichthonios',
      },
      'replaceText': {
        '--knockback stack--': '--R??cksto?? sammeln--',
        'Aetherchain': 'Berstende Ketten',
        'Aetherflail Left': 'Apodiktische Zucht Links',
        'Aetherflail Right': 'Apodiktische Zucht Rechts',
        'Cold Spell': 'Entfesselter Frost',
        'Gaoler\'s Flail Left': 'Eiserne Zucht Links',
        'Gaoler\'s Flail Right': 'Eiserne Zucht Rechts',
        'Heavy Hand': 'Marter',
        'Hot Spell': 'Entfesseltes Feuer',
        'Intemperance': 'Zehrende Elemente',
        'Intemperate Torment': 'Zehrende Vollstreckung',
        'Pitiless Flail': 'Zucht und Ordnung',
        'Powerful Fire': 'Entladenes Feuer',
        'Powerful Light': 'Entladenes Licht',
        'Shining Cells': '??therzwinger',
        'Slam Shut': 'Freigang',
        'True Holy': 'Vollkommenes Sanctus',
        'Warder\'s Wrath': 'Kettenmagie',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Erichthonios': '??richthonios',
      },
      'replaceText': {
        '--knockback stack--': '--package pouss??e--',
        'Aetherchain': 'Cha??nes explosives',
        'Aetherflail Left/Aetherflail Right': 'Cha??ne de r??tribution gauche/droite',
        'Aetherflail Right/Aetherflail Left': 'Cha??ne de r??tribution droite/gauche',
        'Gaoler\'s Flail Left/Gaoler\'s Flail Right': 'Cha??ne punitive gauche/droite',
        'Gaoler\'s Flail Right/Gaoler\'s Flail Left': 'Cha??ne punitive droite/gauche',
        'Heavy Hand': 'Cha??ne de supplice',
        'Hot Spell/Cold Spell': 'D??cha??nement de feu/glace',
        'Intemperance': 'Corrosion ??l??mentaire',
        'Intemperate Torment': 'Ex??cution corrosive',
        'Pitiless Flail': 'Cha??ne transper??ante',
        'Powerful Fire/Powerful Light': 'Explosion infernale/sacr??e',
        'Shining Cells': 'Ge??le limbique',
        'Slam Shut': 'Occlusion terminale',
        'True Holy': 'Miracle v??ritable',
        'Warder\'s Wrath': 'Cha??nes torrentielles',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Erichthonios': '?????????????????????',
      },
      'replaceText': {
        'Aetherchain': '??????',
        'Aetherflail': '????????????',
        'Cold Spell': '??????????????????',
        'Gaoler\'s Flail': '?????????',
        'Heavy Hand': '??????',
        'Hot Spell': '??????????????????',
        'Intemperance': '???????????????',
        'Intemperate Torment': '????????????',
        'Pitiless Flail': '????????????',
        'Powerful Fire': '??????',
        'Powerful Light': '??????',
        'Shining Cells': '????????????',
        'Slam Shut': '????????????',
        'True Holy': '???????????????????????????',
        'Warder\'s Wrath': '????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Erichthonios': '????????????????????????',
      },
      'replaceText': {
        '--knockback stack--': '--????????????--',
        'Aetherchain': '??????',
        'Aetherflail Left': '???????????????',
        'Aetherflail Right': '???????????????',
        'Cold Spell': '?????????????????',
        'Gaoler\'s Flail Left': '???????????????',
        'Gaoler\'s Flail Right': '???????????????',
        'Heavy Hand': '??????',
        'Hot Spell': '?????????????????',
        'Intemperance': '????????????',
        'Intemperate Torment': '????????????',
        'Pitiless Flail': '????????????',
        'Powerful Fire': '??????',
        'Powerful Light': '??????',
        'Shining Cells': '????????????',
        'Slam Shut': '????????????',
        'True Holy': '????????????',
        'Warder\'s Wrath': '????????????',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Erichthonios': '?????????????????????',
      },
      'replaceText': {
        '--knockback stack--': '--?????? ??????--',
        'Aetherchain': '??????',
        'Aetherflail Left/Aetherflail Right': '?????? ?????? ??????/?????????',
        'Aetherflail Right/Aetherflail Left': '?????? ?????? ?????????/??????',
        'Gaoler\'s Flail Left/Gaoler\'s Flail Right': '????????? ??????/?????????',
        'Gaoler\'s Flail Right/Gaoler\'s Flail Left': '????????? ?????????/??????',
        'Heavy Hand': '??????',
        'Hot Spell/Cold Spell': '?????? ??????: ???/??????',
        'Intemperance': '????????? ??????',
        'Intemperate Torment': '?????? ??????',
        'Pitiless Flail': '?????? ??????',
        'Powerful Fire': '??????',
        'Powerful Light': '??????',
        'Shining Cells': '?????? ??????',
        'Slam Shut': '?????? ??????',
        'True Holy': '??? ??????',
        'Warder\'s Wrath': '????????????',
      },
    },
  ],
};

export default triggerSet;
