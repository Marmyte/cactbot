import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Callout cardinal for Spoken Cataract
// TODO: Debuff collect for Marks and callouts for those without debuff
// TODO: Add cardinal to Channeling Flow
// TODO: Fix headmarker ids for Kampeos Harma Callouts

export interface Data extends RaidbossData {
  flareTarget?: string;
  decOffset?: number;
  avarice?: NetMatches['GainsEffect'][];
}

// Due to changes introduced in patch 5.2, overhead markers now have a random offset
// added to their ID. This offset currently appears to be set per instance, so
// we can determine what it is from the first overhead marker we see.
// The first 1B marker in the encounter is an Doubled Impact (0103).
const firstHeadmarker = parseInt('0103', 16);
const getHeadmarkerId = (data: Data, matches: NetMatches['HeadMarker']) => {
  // If we naively just check !data.decOffset and leave it, it breaks if the first marker is 00DA.
  // (This makes the offset 0, and !0 is true.)
  if (typeof data.decOffset === 'undefined')
    data.decOffset = parseInt(matches.id, 16) - firstHeadmarker;
  // The leading zeroes are stripped when converting back to string, so we re-add them here.
  // Fortunately, we don't have to worry about whether or not this is robust,
  // since we know all the IDs that will be present in the encounter.
  return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.AsphodelosTheSecondCircleSavage,
  timelineFile: 'p2s.txt',
  triggers: [
    {
      id: 'P2S Headmarker Tracker',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({}),
      condition: (data) => data.decOffset === undefined,
      // Unconditionally set the first headmarker here so that future triggers are conditional.
      run: (data, matches) => getHeadmarkerId(data, matches),
    },
    {
      id: 'P2S Murky Depths',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6833', source: 'Hippokampos', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'P2S Doubled Impact',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6832', source: 'Hippokampos' }),
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'P2S Sewage Deluge',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6810', source: 'Hippokampos', capture: false }),
      response: Responses.bigAoe(),
    },
    {
      id: 'P2S Spoken Cataract',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: ['6817', '6811', '6812', '6813'], source: 'Hippokampos', capture: false }),
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.directions!(),
      outputStrings: {
        directions: {
          en: 'Back of head',
          de: 'Zur R??ckseite des Kopfes',
          fr: 'Derri??re la t??te',
          ja: '???????????????',
          cn: '???????????????',
          ko: '?????? ????????????',
        },
      },
    },
    {
      id: 'P2S Winged Cataract',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: ['6814', '6815', '6818', '6816'], source: 'Hippokampos', capture: false }),
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.directions!(),
      outputStrings: {
        directions: {
          en: 'Front of head',
          de: 'Zur Vorderseite des Kopfes',
          fr: 'Devant la t??te',
          ja: '????????????',
          cn: '???????????????',
          ko: '?????? ????????????',
        },
      },
    },
    {
      id: 'P2S Ominous Bubbling',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '682B', source: 'Hippokampos', capture: false }),
      suppressSeconds: 1,
      infoText: (_data, _matches, output) => output.groups!(),
      outputStrings: {
        groups: {
          en: 'Healer Groups',
          de: 'Heiler-Gruppen',
          fr: 'Groupes sur les heals',
          ja: '??????????????????',
          cn: '???????????????',
          ko: '?????? ?????? ??????',
        },
      },
    },
    {
      id: 'P2S Mark of the Tides Collect',
      type: 'GainsEffect',
      // Status goes out with Predatory Avarice (6827).
      netRegex: NetRegexes.gainsEffect({ effectId: 'AD0' }),
      run: (data, matches) => (data.avarice ??= []).push(matches),
    },
    {
      id: 'P2S Mark of the Tides',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'AD0', capture: false }),
      delaySeconds: (data) => data.avarice?.length === 2 ? 0 : 0.5,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          marks: {
            en: 'Marks: ${player1}, ${player2}',
            de: 'Marker: ${player1}, ${player2}',
            fr: 'Marques sur : ${player1}, ${player2}',
            ja: '????????????: ${player1}, ${player2}',
            cn: '??????: ${player1}, ${player2}',
            ko: '???: ${player1}, ${player2}',
          },
          avariceOnYou: {
            en: 'Avarice on YOU',
            de: 'Marker auf DIR',
            fr: 'Marque sur VOUS',
            ja: '?????????????????????',
            cn: '????????????',
            ko: '?????? ??? ?????????',
          },
          unknown: Outputs.unknown,
        };

        if (data.avarice === undefined)
          return;

        const name1 = data.avarice[0] ? data.ShortName(data.avarice[0]?.target) : output.unknown!();
        const name2 = data.avarice[1] ? data.ShortName(data.avarice[1]?.target) : output.unknown!();
        const markText = output.marks!({ player1: name1, player2: name2 });

        const isOnYou = data.avarice.find((m) => m.target === data.me);
        if (isOnYou) {
          return {
            alertText: output.avariceOnYou!(),
            infoText: markText,
          };
        }
        return { infoText: markText };
      },
      run: (data) => delete data.avarice,
    },
    {
      id: 'P2S Mark of the Tides Move',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'AD0' }),
      condition: Conditions.targetIsYou(),
      // 23 second duration, safe to move ~16.7s for first time, ~15s for the second.
      delaySeconds: (_data, matches) => parseFloat(matches.duration) - 6,
      alarmText: (_data, _matches, output) => output.awayFromGroup!(),
      outputStrings: {
        awayFromGroup: Outputs.awayFromGroup,
      },
    },
    {
      id: 'P2S Mark of the Depths',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: 'AD1' }),
      condition: Conditions.targetIsYou(),
      alertText: (_data, _matches, output) => output.stackOnYou!(),
      outputStrings: {
        stackOnYou: Outputs.stackOnYou,
      },
    },
    {
      id: 'P2S Channeling Flow',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: ['AD2', 'AD3', 'AD4', 'AD5'] }),
      condition: Conditions.targetIsYou(),
      alertText: (_data, matches, output) => {
        const t = parseFloat(matches.duration);
        // Effect durations are 13 seconds (short) and 28 seconds (long)
        if (t < 15)
          return output.arrowFirst!();
        return output.spreadFirst!();
      },
      outputStrings: {
        arrowFirst: {
          en: 'Arrow First',
          de: 'Pfeil zuerst',
          fr: 'Fl??ches en premi??res',
          ja: '???????????????',
          cn: '?????????',
          ko: '????????? ?????? ??????',
        },
        spreadFirst: {
          en: 'Spread First',
          de: 'Verteilen zuerst',
          fr: 'Dispersez-vous en premier',
          ja: '???????????????',
          cn: '?????????',
          ko: '?????? ??????',
        },
      },
    },
    {
      // Aoe from head outside the arena
      id: 'P2S Dissociation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '682E', source: 'Hippokampos' }),
      alertText: (_data, matches, output) => {
        const xCoord = parseFloat(matches.x);
        if (xCoord > 100)
          return output.w!();
        if (xCoord < 100)
          return output.e!();
      },
      outputStrings: {
        e: Outputs.east,
        w: Outputs.west,
      },
    },
    {
      // Spread aoe marker on some players, not all
      id: 'P2S Tainted Flood',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6838', source: 'Hippokampos' }),
      condition: (data, matches) => matches.target === data.me,
      response: Responses.spread(),
    },
    {
      id: 'P2S Coherence Flare',
      type: 'Tether',
      // Whoever has tether when cast of 681B ends will be flared
      netRegex: NetRegexes.tether({ id: '0054', source: 'Hippokampos' }),
      condition: Conditions.targetIsYou(),
      infoText: (_data, _matches, output) => output.text!(),
      run: (data, matches) => data.flareTarget = matches.target,
      outputStrings: {
        text: {
          en: 'Flare Tether',
          de: 'Flare Verbindung',
          fr: 'Lien Brasier',
          ja: '???????????????',
          cn: '????????????',
          ko: '????????? ???',
        },
      },
    },
    {
      id: 'P2S Coherence Stack',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '681B', source: 'Hippokampos' }),
      condition: (data) => data.flareTarget !== data.me,
      // 12 second cast, delay for tether to settle
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 6,
      alertText: (data, _matches, output) => {
        if (data.role === 'tank')
          return output.flareLineTank!();
        return output.flareLineStack!();
      },
      outputStrings: {
        flareLineStack: {
          en: 'Line Stack (behind tank)',
          de: 'Linien-Sammeln (hinter dem Tank)',
          fr: 'Package en ligne (derri??re le tank)',
          ja: '??????????????????????????????????????????',
          cn: '?????????????????????????????????',
          ko: '?????? ?????? (?????? ??????)',
        },
        flareLineTank: {
          en: 'Line Stack (be in front)',
          de: 'Linien-Sammeln (vorne sein)',
          fr: 'Package en ligne (Placez-vous devant)',
          ja: '???????????????????????????????????????',
          cn: '?????????????????????????????????',
          ko: '?????? ?????? (??? ?????????)',
        },
      },
    },
    {
      // Raidwide knockback -> dont get knocked into slurry
      id: 'P2S Shockwave',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '682F', source: 'Hippokampos' }),
      // 7.7 cast time, delay for proper arm's length
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.knockback(),
    },
    {
      id: 'P2S Kampeos Harma Marker',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({}),
      condition: Conditions.targetIsYou(),
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          squareAcross: {
            en: '#${num} Square, go across',
            de: '#${num} Viereck, geh gegen??ber',
            fr: '#${num} Carr??, allez ?? l\'oppos??',
            ja: '?????? #${num}?????????????????????',
            cn: '?????? #${num}: ???Boss??????',
            ko: '#${num} ??????, ?????? ?????? ????????????',
          },
          // Trying not to confuse with boss/across
          squareBoss: {
            en: '#${num} Square, boss tile',
            de: '#${num} Viereck, Boss Fl??che',
            fr: '#${num} Carr??, case du boss',
            ja: '?????? #${num}??????????????????',
            cn: '?????? #${num}: ???Boss??????',
            ko: '#${num} ??????, ?????? ????????????',
          },
          triangle: {
            en: '#${num} Triangle',
            de: '#${num} Dreieck',
            fr: '#${num} Triangle',
            ja: '?????? #${num}',
            cn: '?????? #${num}',
            ko: '#${num} ??????',
          },
        };

        const id = getHeadmarkerId(data, matches);
        if (!id)
          return;
        const harmaMarkers = [
          '0091',
          '0092',
          '0093',
          '0094',
          '0095',
          '0096',
          '0097',
          '0098',
        ];

        if (!harmaMarkers.includes(id))
          return;

        let num = parseInt(id);
        const isTriangle = num >= 95;
        num -= 90;
        if (isTriangle)
          num -= 4;

        // 1/3 have to run to the other side, so make this louder.
        const isOdd = num % 2;
        if (isTriangle)
          return { ['infoText']: output.triangle!({ num: num }) };
        else if (isOdd)
          return { ['alarmText']: output.squareAcross!({ num: num }) };
        return { ['alertText']: output.squareBoss!({ num: num }) };
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Spoken Cataract/Winged Cataract': 'Spoken/Winged Cataract',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Hippokampos': 'Hippokampos',
      },
      'replaceText': {
        '\\(knockback\\)': '(R??cksto??)',
        '\\(short\\)': '(Kurz)',
        '\\(long\\)': '(Lang)',
        'Channeling Flow': 'Kanalschnellen',
        'Channeling Overflow': 'Kanalfluten',
        'Coherence(?! [FL])': 'Koh??renz',
        'Coherence Flare': 'Koh??renz Flare',
        'Coherence Line': 'Koh??renz Linie',
        'Crash': 'Impakt',
        'Deadly Current': 'T??dliche Str??mung',
        'Dissociation(?! Dive)': 'Dissoziation',
        'Dissociation Dive': 'Dissoziation Sturzflug',
        'Doubled Impact': 'Doppeleinschlag',
        'Great Typhoon': 'Gro??e Welle',
        'Hard Water': 'Rei??endes Wasser',
        'Kampeos Harma': 'Kampeos Harma',
        'Murky Depths': 'Tr??be Tiefen',
        'Ominous Bubbling(?! Groups)': 'Kopfwasser',
        'Ominous Bubbling Groups': 'Kopfwasser Gruppen',
        'Predatory Avarice': 'Massenmal',
        'Predatory Sight': 'Mal der Beute',
        'Sewage Deluge': 'Abwasserflut',
        'Sewage Eruption': 'Abwassereruption',
        'Shockwave': 'Schockwelle',
        'Spoken Cataract': 'Gehauchter Katarakt',
        'Tainted Flood': 'Verseuchte Flut',
        'Winged Cataract': 'Beschwingter Katarakt',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Hippokampos': 'hippokampos',
      },
      'replaceText': {
        '\\(long\\)': '(long)',
        '\\(knockback\\)': '(pouss??e)',
        '\\(short\\)': '(court)',
        'Channeling Flow': 'Courant canalisant',
        'Channeling Overflow': 'D??versement canalisant',
        'Coherence(?! [FL])': 'Coh??rence',
        'Coherence Flare': 'Coh??rence Brasier',
        'Coherence Line': 'Coh??rence en ligne',
        'Crash': 'Collision',
        'Deadly Current': 'Torrent mortel',
        'Dissociation(?! Dive)': 'Dissociation',
        'Dissociation Dive': 'Dissociation et plongeon',
        'Doubled Impact': 'Double impact',
        'Great Typhoon': 'Flots tumultueux',
        'Hard Water': 'Oppression aqueuse',
        'Kampeos Harma': 'Kampeos harma',
        'Murky Depths': 'Tr??fonds troubles',
        'Ominous Bubbling(?! Groups)': 'Hydro-agression',
        'Ominous Bubbling Groups': 'Hydro-agression en groupes',
        'Predatory Avarice': 'Double marque',
        'Predatory Sight': 'Marque de la proie',
        'Sewage Deluge': 'D??luge d\'eaux us??es',
        'Sewage Eruption': '??ruption d\'eaux us??es',
        'Shockwave': 'Onde de choc',
        'Spoken Cataract/Winged Cataract': 'Souffle/Aile et cataracte',
        'Tainted Flood': 'Inondation inf??me',
        'Winged Cataract/Spoken Cataract': 'Aile/Souffle et cataracte',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Hippokampos': '?????????????????????',
      },
      'replaceText': {
        'Channeling Flow': '???????????????????????????',
        'Channeling Overflow': '???????????????????????????????????????',
        'Coherence(?! [FL])': '??????????????????',
        'Crash': '??????',
        'Deadly Current': '?????????',
        'Dissociation': '???????????????????????????',
        'Doubled Impact': '????????????????????????',
        'Great Typhoon': '??????',
        'Hard Water': '?????????',
        'Kampeos Harma': '????????????????????????',
        'Murky Depths': '????????????????????????',
        'Ominous Bubbling': '?????????',
        'Predatory Avarice': '????????????',
        'Predatory Sight': '???????????????',
        'Sewage Deluge': '??????????????????????????????',
        'Sewage Eruption': '?????????????????????????????????',
        'Shockwave': '????????????????????????',
        'Spoken Cataract': '?????????????????????????????????',
        'Tainted Flood': '??????????????????????????????',
        'Winged Cataract': '????????????????????????????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Hippokampos': '???????????????',
      },
      'replaceText': {
        '\\(knockback\\)': '(??????)',
        '\\(short\\)': '(???)',
        '\\(long\\)': '(???)',
        'Channeling Flow': '????????????',
        'Channeling Overflow': '????????????',
        'Coherence(?! [FL])': '????????????',
        'Coherence Flare': '???????????? (??????)',
        'Coherence Line': '???????????? (??????)',
        'Crash': '??????',
        'Deadly Current': '?????????',
        'Dissociation(?! Dive)': '??????',
        'Dissociation Dive': '?????? (??????)',
        'Doubled Impact': '????????????',
        'Great Typhoon': '??????',
        'Hard Water': '?????????',
        'Kampeos Harma': '????????????',
        'Murky Depths': '????????????',
        'Ominous Bubbling(?! Groups)': '?????????',
        'Ominous Bubbling Groups': '????????? (??????)',
        'Predatory Avarice': '????????????',
        'Predatory Sight': '???????????????',
        'Sewage Deluge': '????????????',
        'Sewage Eruption': '????????????',
        'Shockwave': '?????????',
        'Spoken Cataract': '????????????',
        'Tainted Flood': '????????????',
        'Winged Cataract': '????????????',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Hippokampos': '???????????????',
      },
      'replaceText': {
        '\\(knockback\\)': '(??????)',
        '\\(short\\)': '(13???)',
        '\\(long\\)': '(28???)',
        'Channeling Flow': '????????? ??????',
        'Channeling Overflow': '????????? ??????',
        'Coherence(?! [FL])': '?????? ??????',
        'Coherence Flare': '?????? ?????? (?????????)',
        'Coherence Line': '?????? ?????? (??????)',
        'Crash': '??????',
        'Deadly Current': '?????? ??????',
        'Dissociation(?! Dive)': '?????? ??????',
        'Dissociation Dive': '?????? ?????? (??????)',
        'Doubled Impact': '?????? ??????',
        'Great Typhoon': '??????',
        'Hard Water': '????????? ????????????',
        'Kampeos Harma': '???????????? ??????',
        'Murky Depths': '?????? ??????',
        'Ominous Bubbling(?! Groups)': '????????? ?????????',
        'Ominous Bubbling Groups': '????????? ????????? (??????)',
        'Predatory Avarice': '?????? ??????',
        'Predatory Sight': '????????? ??????',
        'Sewage Deluge': '?????? ??????',
        'Sewage Eruption': '?????? ??????',
        'Shockwave': '?????? ??????',
        'Spoken Cataract/Winged Cataract': '??????/????????? ??????',
        'Tainted Flood': '?????? ??????',
        'Winged Cataract/Spoken Cataract': '?????????/?????? ??????',
      },
    },
  ],
};

export default triggerSet;
