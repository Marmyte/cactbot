import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  boldBoulderTargets: string[];
  hairFlayUpbraidTargets: string[];
}

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.StormsCrownExtreme,
  timelineFile: 'barbariccia-ex.txt',
  initData: () => {
    return {
      boldBoulderTargets: [],
      hairFlayUpbraidTargets: [],
    };
  },
  timelineTriggers: [
    {
      id: 'BarbaricciaEx Knuckle Drum',
      regex: /Knuckle Drum/,
      beforeSeconds: 5,
      response: Responses.bigAoe(),
    },
    {
      id: 'BarbaricciaEx Blow Away',
      regex: /Blow Away/,
      beforeSeconds: 5,
      response: Responses.getTogether('info'),
    },
  ],
  triggers: [
    {
      id: 'BarbaricciaEx Void Aero IV',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7570', source: 'Barbariccia', capture: false }),
      response: Responses.aoe(),
    },
    {
      // Savage Barbery has 3 casts that all start at the same time.
      // 5.7 duration: 7464, 7465, 7466, 7489, 748B, 7573 (all actual cast bar, unknown how to differentiate)
      // 6.7 duration: 7574 (donut), 757A (line)
      // 8.8 duration: 7575 (out, paired with donut), 757B (out, paired with line)
      id: 'BarbaricciaEx Savage Barbery Donut',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7574', source: 'Barbariccia', capture: false }),
      response: Responses.getIn(),
    },
    {
      id: 'BarbaricciaEx Savage Barbery Line',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '757A', source: 'Barbariccia', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out and Away',
          de: 'Raus und Weg',
          fr: 'Ext??rieur et derri??re',
        },
      },
    },
    {
      // Hair Raid has 2 casts that start at the same time, then a slight delay for stack/spread.
      // 5.7 duration: 757C (wall), 757E (donut)
      // 7.7 duration: 757D (paired with wall), 757F (paired with donut)
      //
      // ~2.2s delay, and then:
      // 7.7 duration (Hair Spray): 75A6
      // 7.7 duration (Deadly Twist): 75A7
      id: 'BarbaricciaEx Hair Raid Donut',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '757E', source: 'Barbariccia', capture: false }),
      response: Responses.getIn(),
    },
    {
      id: 'BarbaricciaEx Hair Raid Wall',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '757C', source: 'Barbariccia', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Wall',
          de: 'Wand',
          fr: 'Mur',
        },
      },
    },
    {
      id: 'BarbaricciaEx Hair Spray',
      type: 'StartsUsing',
      // This spread mechanic is used later in other phases of the fight as well.
      netRegex: NetRegexes.startsUsing({ id: '75A6', source: 'Barbariccia', capture: false }),
      suppressSeconds: 1,
      response: Responses.spread(),
    },
    {
      id: 'BarbaricciaEx Deadly Twist',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '75A7', source: 'Barbariccia', capture: false }),
      suppressSeconds: 2,
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
      id: 'BarbaricciaEx Void Aero III',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7571', source: 'Barbariccia' }),
      condition: Conditions.caresAboutPhysical(),
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'BarbaricciaEx Secret Breeze',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7580', source: 'Barbariccia', capture: false }),
      durationSeconds: 3,
      alertText: (_data, _matches, output) => output.protean!(),
      outputStrings: {
        protean: {
          en: 'Protean',
          de: 'Himmelsrichtungen',
          fr: 'Positions',
          ja: '8????????????',
          cn: '???????????????',
          ko: '????????? ????????? ??????',
        },
      },
    },
    {
      id: 'BarbaricciaEx Boulder Break',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7383', source: 'Barbariccia' }),
      response: Responses.sharedTankBuster(),
    },
    {
      id: 'BarbaricciaEx Brittle Boulder',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ id: '016D', capture: false }),
      suppressSeconds: 2,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Bait Middle => Out (Spread)',
          de: 'In der Mitte K??dern => Raus (verteilen)',
          fr: 'Posez au centre -> ??cartez-vous ?? l\'ext??rieur',
          cn: '??????????????????????????????',
        },
      },
    },
    {
      // These also favor a certain order of Tank/Healer for first set then DPS second set,
      // but if people are dead anybody can get these.
      id: 'BarbaricciaEx Brutal Rush',
      type: 'Tether',
      netRegex: NetRegexes.tether({ id: '0011' }),
      condition: (data, matches) => matches.source === data.me,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Brutal Rush tether on You',
          de: 'Grausame Hatz Verbindung auf DIR',
          fr: 'Lien de Ru??e brutale sur VOUS',
          cn: '????????????',
        },
      },
    },
    {
      id: 'BarbaricciaEx Brutal Rush Move',
      type: 'Ability',
      // When the Brutal Rush hits you, the follow-up Brutal Gust has locked in.
      netRegex: NetRegexes.ability({ id: '7583', source: 'Barbariccia' }),
      condition: Conditions.targetIsYou(),
      response: Responses.moveAway(),
    },
    {
      id: 'BarbaricciaEx Hair Flay',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7413', source: 'Barbariccia' }),
      alertText: (data, matches, output) => {
        data.hairFlayUpbraidTargets.push(matches.target);
        if (data.me === matches.target)
          return output.spread!();
      },
      outputStrings: {
        spread: Outputs.spread,
      },
    },
    {
      id: 'BarbaricciaEx Upbraid',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '75A8', source: 'Barbariccia' }),
      alertText: (data, matches, output) => {
        data.hairFlayUpbraidTargets.push(matches.target);
        if (data.me === matches.target)
          return output.partnerStack!();
      },
      outputStrings: {
        partnerStack: {
          en: 'Partner Stack',
          de: 'Mit Partner sammeln',
          fr: 'Package partenaire',
        },
      },
    },
    {
      id: 'BarbaricciaEx Upbraid Untargeted',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '75A8', source: 'Barbariccia', capture: false }),
      delaySeconds: 0.5,
      suppressSeconds: 2,
      alertText: (data, _matches, output) => {
        if (data.hairFlayUpbraidTargets.includes(data.me))
          return;
        return output.partnerStack!();
      },
      run: (data) => data.hairFlayUpbraidTargets = [],
      outputStrings: {
        partnerStack: {
          en: 'Partner Stack (unmarked)',
          de: 'Mit Partner sammeln (nicht markiert)',
          fr: 'Package partenaire (sans marque)',
        },
      },
    },
    {
      id: 'BarbaricciaEx Bold Boulder',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '759B', source: 'Barbariccia' }),
      infoText: (data, matches, output) => {
        data.boldBoulderTargets.push(matches.target);
        if (data.me === matches.target)
          return output.flareOnYou!();
      },
      outputStrings: {
        flareOnYou: {
          en: 'Flare on YOU',
          de: 'Flare auf DIR',
          fr: 'Brasier sur VOUS',
          ja: '??????????????????',
          cn: '????????????',
          ko: '????????? ?????????',
        },
      },
    },
    {
      id: 'BarbaricciaEx Trample',
      type: 'StartsUsing',
      // There's no castbar for Trample, so use Bold Boulder and collect flares.
      // There's also an 0064 stack headmarker, but that's used elsewhere.
      netRegex: NetRegexes.startsUsing({ id: '759B', source: 'Barbariccia', capture: false }),
      delaySeconds: 0.5,
      suppressSeconds: 1,
      // info to match spread and flare to not conflict during knockback
      infoText: (data, _matches, output) => {
        if (data.boldBoulderTargets.includes(data.me))
          return;
        return output.stackMarker!();
      },
      run: (data) => data.boldBoulderTargets = [],
      outputStrings: {
        stackMarker: Outputs.stackMarker,
      },
    },
    {
      id: 'BarbaricciaEx Impact',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '75A0', source: 'Barbariccia' }),
      // Could also have used 75A1, full cast time is 5.9s
      delaySeconds: (_data, matches) => parseFloat(matches.castTime) - 5,
      response: Responses.knockback(),
    },
    {
      id: 'BarbaricciaEx Playstation Hair Chains',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker(),
      condition: Conditions.targetIsYou(),
      alertText: (_data, matches, output) => {
        switch (matches.id) {
          case '016F':
            return output.circle!();
          case '0170':
            return output.triangle!();
          case '0171':
            return output.square!();
          case '0172':
            return output.cross!();
        }
      },
      outputStrings: {
        circle: {
          en: 'Red Circle',
          de: 'Roter Kreis',
          fr: 'Cercle rouge',
          ja: '?????????',
          cn: '??????',
          ko: '?????? ????????????',
        },
        triangle: {
          en: 'Green Triangle',
          de: 'Gr??nes Dreieck',
          fr: 'Triangle vert',
          ja: '???????????????',
          cn: '?????????',
          ko: '?????? ??????',
        },
        square: {
          en: 'Purple Square',
          de: 'Lilanes Viereck',
          fr: 'Carr?? violet',
          ja: '????????????',
          cn: '?????????',
          ko: '?????? ??????',
        },
        cross: {
          en: 'Blue X',
          de: 'Blaues X',
          fr: 'Croix bleue',
          ja: '?????????',
          cn: '??????',
          ko: '?????? X',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Barbariccia': 'Barbarizia',
        'Stiff Breeze': 'F??hn',
      },
      'replaceText': {
        'Blow Away': 'Hauerwelle',
        'Blustery Ruler': 'Tosende Herrin',
        'Bold Boulder': 'Feister Fels',
        '(?<!(Brittle|Bold) )Boulder(?! Break)': 'Fels',
        'Boulder Break': 'Felsbruch',
        'Brittle Boulder': 'Feiner Fels',
        'Brush with Death': 'Haaresbreite',
        'Brutal Gust': 'Grausame B??',
        'Brutal Rush': 'Grausame Hatz',
        'Catabasis': 'Katabasis',
        'Curling Iron': 'In Schale',
        'Deadly Twist': 'Flechtfolter',
        'Dry Blows': 'Haue',
        'Entanglement': 'Fesselnde Str??hnen',
        'Fetters': 'Fesselung',
        'Hair Raid': 'Haarstreich',
        'Hair Spray': 'Wildwuchs',
        'Impact': 'Impakt',
        'Iron Out': 'Coiffure',
        'Knuckle Drum': 'Kahlhieb',
        'Maelstrom': 'Charybdis',
        'Raging Storm': 'Tobender Sturm',
        'Savage Barbery': 'Brutale Barbierei',
        'Secret Breeze': 'Heimlicher Hauch',
        '(?<!(Teasing |En))Tangle': 'Str??hne',
        'Teasing Tangles': 'Sinistre Str??hnen',
        'Tornado Chain': 'Kettenorkan',
        'Tousle': 'F??hn',
        'Trample': 'Trampeln',
        'Upbraid': 'Sturmfrisur',
        'Void Aero III': 'Nichts-Windga',
        'Void Aero IV': 'Nichts-Windka',
        'Voidstrom': 'Nichtssturm',
        'Winding Gale': 'Windende Winde',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Barbariccia': 'Barbariccia',
        'Stiff Breeze': 'rafale de vent',
      },
      'replaceText': {
        'Blow Away': 'Coups convulsifs',
        'Blustery Ruler': 'Despote venteux',
        'Bold Boulder': 'Grand conglom??rat',
        '(?<!(Brittle|Bold) )Boulder(?! Break)': 'Conglom??rat',
        'Boulder Break': 'Conglom??rat pesant',
        'Brittle Boulder': 'Petit conglom??rat',
        'Brush with Death': 'Brossage mortel',
        'Brutal Gust': 'Rafale brutale',
        'Brutal Rush': 'Ru??e brutale',
        'Catabasis': 'Catabase',
        'Curling Iron': 'Boucle de fer',
        'Deadly Twist': 'N??ud fatal',
        'Dry Blows': 'Coups secs',
        'Entanglement': 'Enchev??trement',
        'Fetters': 'Attache',
        'Hair Raid': 'Raid capillaire',
        'Hair Spray': 'Tresse laqu??e',
        'Impact': 'Impact',
        'Iron Out': 'Repassage capillaire',
        'Knuckle Drum': 'Batterie de poings',
        'Maelstrom': 'Charybde',
        'Raging Storm': 'Temp??te enrag??e',
        'Savage Barbery': 'Barbarie sauvage',
        'Secret Breeze': 'Brise secr??te',
        '(?<!(Teasing |En))Tangle': 'Emm??lement',
        'Teasing Tangles': 'Emm??lement railleur',
        'Tornado Chain': 'Cha??ne de tornades',
        'Tousle': '??bourrifage',
        'Trample': 'Mart??lement',
        'Upbraid': 'Natte sermonneuse',
        'Void Aero III': 'M??ga Vent du n??ant',
        'Void Aero IV': 'Giga Vent du n??ant',
        'Voidstrom': 'Temp??te du n??ant',
        'Winding Gale': 'Vent sinueux',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Barbariccia': '??????????????????',
        'Stiff Breeze': '??????',
      },
      'replaceText': {
        'Blow Away': '????????????',
        'Blustery Ruler': '?????????????????????',
        'Bold Boulder': '?????????',
        '(?<!(Brittle|Bold) )Boulder(?! Break)': '??????',
        'Boulder Break': '?????????',
        'Brittle Boulder': '?????????',
        'Brush with Death': '????????????',
        'Brutal Gust': '????????????????????????',
        'Brutal Rush': '???????????????????????????',
        'Catabasis': '???????????????',
        'Curling Iron': '????????????',
        'Deadly Twist': '?????????',
        'Dry Blows': '??????',
        'Entanglement': '????????????',
        'Fetters': '??????',
        'Hair Raid': '???????????????',
        'Hair Spray': '?????????',
        'Impact': '??????',
        'Iron Out': '????????????',
        'Knuckle Drum': '?????????????????????',
        'Maelstrom': '?????????????????????',
        'Raging Storm': '???????????????????????????',
        'Savage Barbery': '???????????????????????????',
        'Secret Breeze': '??????????????????????????????',
        '(?<!(Teasing |En))Tangle': '??????',
        'Teasing Tangles': '????????????',
        'Tornado Chain': '???????????????????????????',
        'Tousle': '??????',
        'Trample': '????????????',
        'Upbraid': '?????????',
        'Void Aero III': '???????????????????????????',
        'Void Aero IV': '??????????????????????????????',
        'Voidstrom': '????????????????????????',
        'Winding Gale': '??????????????????????????????',
      },
    },
  ],
};

export default triggerSet;
