import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import { UnreachableCode } from '../../../../../resources/not_reached';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { NetMatches } from '../../../../../types/net_matches';
import { TriggerSet } from '../../../../../types/trigger';

export interface Data extends RaidbossData {
  deathsToll?: boolean;
  deathsTollPending?: boolean;
  sunbirdTethers: NetMatches['Tether'][];
  sunbirds: NetMatches['AddedCombatant'][];
  decOffset?: number;
}

// Due to changes introduced in patch 5.2, overhead markers now have a random offset
// added to their ID. This offset currently appears to be set per instance, so
// we can determine what it is from the first overhead marker we see.
// The first 1B marker in the encounter is the #1 Bright Fire marker (004F).
const firstHeadmarker = parseInt('004F', 16);
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
  zoneId: ZoneId.AsphodelosTheThirdCircleSavage,
  timelineFile: 'p3s.txt',
  initData: () => {
    return {
      sunbirds: [],
      sunbirdTethers: [],
    };
  },
  triggers: [
    {
      id: 'P3S Headmarker Tracker',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({}),
      condition: (data) => data.decOffset === undefined,
      // Unconditionally set the first headmarker here so that future triggers are conditional.
      run: (data, matches) => getHeadmarkerId(data, matches),
    },
    {
      id: 'P3S Scorched Exaltation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6706', source: 'Phoinix', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'P3S Darkened Fire',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66B9', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Fire Positions',
          de: 'Feuer-Positionen',
          fr: 'Positions pour les flammes',
          ja: '???????????????????????????',
          cn: '????????????',
          ko: '?????? ??????',
        },
      },
    },
    {
      id: 'P3S Heat of Condemnation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6700', source: 'Phoinix', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Tank Tethers',
          de: 'Tank-Verbindungen',
          fr: 'Liens Tank',
          ja: '??????????????????',
          cn: '????????????',
          ko: '????????? ??? ????????????',
        },
      },
    },
    {
      id: 'P3S Experimental Fireplume Rotating Cast',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66C0', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Middle (then rotate)',
          de: 'Geh in die Mitte (und rotiere dann)',
          fr: 'Placez-vous au milieu (puis tournez)',
          ja: '?????? ??? ?????????????????????',
          cn: '????????????, ?????????',
          ko: '????????? ??? ?????? ??????, ?????? ?????? ??????',
        },
      },
    },
    {
      id: 'P3S Experimental Fireplume Out Cast',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66BE', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Middle (then out)',
          de: 'Geh in die Mitte (und dann raus)',
          fr: 'Placez-vous au milieu (puis sortez)',
          ja: '?????? ??? ??????????????????',
          cn: '????????????, ????????????',
          ko: '????????? ??? ??? ??????, ?????????',
        },
      },
    },
    {
      id: 'P3S Experimental Fireplume Out Marker',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '66BE', source: 'Phoinix', capture: false }),
      // goldfish brain needs an extra "get out" call
      response: Responses.getOut(),
    },
    {
      id: 'P3S Right Cinderwing',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6702', source: 'Phoinix', capture: false }),
      response: Responses.goLeft(),
    },
    {
      id: 'P3S Left Cinderwing',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6703', source: 'Phoinix', capture: false }),
      response: Responses.goRight(),
    },
    {
      id: 'P3S Flare of Condemnation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66FB', source: 'Phoinix', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Sides + Spread',
          de: 'Seiten + Verteilen',
          fr: 'C??t??s + Dispersez-vous',
          ja: '?????????????????????',
          cn: '?????? + ??????',
          ko: '??????????????? ??????',
        },
      },
    },
    {
      id: 'P3S Spark of Condemnation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66FC', source: 'Phoinix', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Middle Pairs',
          de: 'Mittlere Paare',
          fr: 'Paires au milieu',
          ja: '??????????????????????????????????????????',
          cn: '?????? ????????????',
          ko: '???????????? 2?????? ??????',
        },
      },
    },
    {
      id: 'P3S Bright Fire Marker and Fledgling Flights',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({}),
      condition: Conditions.targetIsYou(),
      alertText: (data, matches, output) => {
        const id = getHeadmarkerId(data, matches);
        return {
          '004F': output.num1!(),
          '0050': output.num2!(),
          '0051': output.num3!(),
          '0052': output.num4!(),
          '0053': output.num5!(),
          '0054': output.num6!(),
          '0055': output.num7!(),
          '0056': output.num8!(),
          '006B': data.deathsToll ? output.west!() : output.east!(),
          '006C': data.deathsToll ? output.east!() : output.west!(),
          '006D': data.deathsToll ? output.north!() : output.south!(),
          '006E': data.deathsToll ? output.south!() : output.north!(),
        }[id];
      },
      outputStrings: {
        num1: Outputs.num1,
        num2: Outputs.num2,
        num3: Outputs.num3,
        num4: Outputs.num4,
        num5: Outputs.num5,
        num6: Outputs.num6,
        num7: Outputs.num7,
        num8: Outputs.num8,
        east: Outputs.east,
        west: Outputs.west,
        south: Outputs.south,
        north: Outputs.north,
      },
    },
    {
      id: 'P3S Sunbird Tether Collector',
      type: 'Tether',
      // 0039 when pink, 0001 when stretched purple.
      // TODO: in general, it seems like the tethers are picked to start unstretched,
      // but plausibly you could create a scenario where one starts stretched?
      netRegex: NetRegexes.tether({ source: 'Sunbird', id: ['0039', '0001'] }),
      run: (data, matches) => data.sunbirdTethers.push(matches),
    },
    {
      id: 'P3S Sunbird Collector',
      type: 'AddedCombatant',
      // Small birds are 13633, and big birds are 13635.
      netRegex: NetRegexes.addedCombatantFull({ npcBaseId: '13635' }),
      run: (data, matches) => data.sunbirds.push(matches),
    },
    {
      id: 'P3S Sunbird Tether',
      type: 'Tether',
      // There is no need for a delay here, because all of the tethers are ordered:
      //   SunbirdA => Player1
      //   Player1 => Player2
      //   SunbirdB => Player3
      //   Player3 => Player4
      // ...therefore if this tether has the current player as a target, then we
      // will have seen the Sunbird => Player tether previously if it exists in the
      // Sunbird Tether Collector line.
      netRegex: NetRegexes.tether({ id: ['0039', '0001'] }),
      condition: Conditions.targetIsYou(),
      // There are additional tether lines when you stretch/unstretch the tether, and
      // adds will re-tether somebody new if somebody dies right before dashing.  Only call once.
      suppressSeconds: 9999,
      alertText: (data, matches, output) => {
        const myTether = matches;
        const parentTether = data.sunbirdTethers.find((x) => x.targetId === myTether.sourceId);

        const birdId = parentTether?.sourceId ?? myTether.sourceId;
        const bird = data.sunbirds.find((x) => x.id === birdId);
        if (!bird) {
          // Note: 0001 tethers happen later with the Sunshadow birds during the Fountain of Fire
          // section.  In most cases, a player will get a tether during add phase and then this
          // will be suppressed in the fountain section.  In the rare case they don't, they
          // may get this error, but nothing will be printed on screen.
          console.error(`SunbirdTether: no bird ${birdId}`);
          return;
        }

        const centerX = 100;
        const centerY = 100;
        const x = parseFloat(bird.x) - centerX;
        const y = parseFloat(bird.y) - centerY;
        const birdDir = Math.round(4 - 4 * Math.atan2(x, y) / Math.PI) % 8;

        const adjustedDir = (birdDir + (parentTether === undefined ? 4 : 0)) % 8;
        const outputDir = {
          0: output.north!(),
          1: output.northeast!(),
          2: output.east!(),
          3: output.southeast!(),
          4: output.south!(),
          5: output.southwest!(),
          6: output.west!(),
          7: output.northwest!(),
        }[adjustedDir];
        if (!outputDir)
          throw new UnreachableCode();

        if (parentTether)
          return output.playerTether!({ dir: outputDir, player: data.ShortName(myTether.source) });
        return output.birdTether!({ dir: outputDir });
      },
      outputStrings: {
        playerTether: {
          en: '${dir} (away from ${player})',
          de: '${dir} (weg von ${player})',
          fr: '${dir} (??loignez-vous de ${player})',
          ja: '${dir} (${player}????????????)',
          cn: '${dir} (??????${player})',
          ko: '${dir} (${player}????????? ?????? ????????????)',
        },
        birdTether: {
          en: '${dir} (away from bird)',
          de: '${dir} (weg vom Vogel)',
          fr: '${dir} (??loignez-vous de l\'oiseau)',
          ja: '${dir} (???????????????)',
          cn: '${dir} (?????????)',
          ko: '${dir} (?????? ?????? ????????????)',
        },
        north: Outputs.north,
        northeast: Outputs.northeast,
        east: Outputs.east,
        southeast: Outputs.southeast,
        south: Outputs.south,
        southwest: Outputs.southwest,
        west: Outputs.west,
        northwest: Outputs.northwest,
      },
    },
    {
      id: 'P3S Dead Rebirth',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66E4', source: 'Phoinix', capture: false }),
      response: Responses.bigAoe(),
    },
    {
      id: 'P3S Experimental Gloryplume Rotate Cast',
      type: 'StartsUsing',
      // 66CA (self) -> 66CB (rotating) -> etc
      netRegex: NetRegexes.startsUsing({ id: '66CA', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Middle (then rotate)',
          de: 'Geh in die Mitte (und rotiere dann)',
          fr: 'Placez-vous au milieu (puis tournez)',
          ja: '?????? ??? ?????????????????????',
          cn: '????????????, ?????????',
          ko: '????????? ??? ?????? ??????, ?????? ?????? ??????',
        },
      },
    },
    {
      id: 'P3S Experimental Gloryplume Out Cast',
      type: 'StartsUsing',
      // 66C6 (self) -> 66C7 (middle) -> etc
      netRegex: NetRegexes.startsUsing({ id: '66C6', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Get Middle (then out)',
          de: 'Geh in die Mitte (und dann raus)',
          fr: 'Placez-vous au milieu (puis sortez)',
          ja: '?????? ??? ??????????????????',
          cn: '????????????, ????????????',
          ko: '????????? ??? ??? ??????, ?????????',
        },
      },
    },
    {
      id: 'P3S Experimental Gloryplume Out',
      type: 'Ability',
      // 66C6 (self) -> 66C7 (middle) -> etc
      netRegex: NetRegexes.ability({ id: '66C6', source: 'Phoinix', capture: false }),
      // If you hang around to wait for the spread/stack, you will get killed.
      // It's easy to get complacement by the end of the fight, so make this loud.
      response: Responses.getOut('alarm'),
    },
    {
      id: 'P3S Experimental Gloryplume Stack',
      type: 'Ability',
      // 66CA (self) -> 66CB (rotating) -> 66CC (instant) -> 66CD (stacks)
      // 66C6 (self) -> 66C7 (middle) -> 66CC (instant) -> 66CD (stacks)
      netRegex: NetRegexes.ability({ id: '66CC', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stacks After',
          de: 'Danach sammeln',
          fr: 'Packez-vous apr??s',
          ja: '??????????????????',
          cn: '????????????',
          ko: '??? ?????? ??????',
        },
      },
    },
    {
      id: 'P3S Experimental Gloryplume Spread',
      type: 'Ability',
      // 66CA (self) -> 66CB (rotating) -> 66C8 (instant) -> 66C9 (spread)
      // 66C6 (self) -> 66C7 (middle) -> 66C8 (instant) -> 66C9 (spread)
      netRegex: NetRegexes.ability({ id: '66C8', source: 'Phoinix', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread After',
          de: 'Danach verteilen',
          fr: 'Dispersez-vous apr??s',
          ja: '???????????????',
          cn: '????????????',
          ko: '??? ?????? ??????',
        },
      },
    },
    {
      id: 'P3S Sun\'s Pinion',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({}),
      condition: (data, matches) => data.me === matches.target && getHeadmarkerId(data, matches) === '007A',
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread => Bird Tether',
          de: 'Verteilen => Vogel-Verbindungen',
          fr: 'Dispersez-vous => Liens oiseaux',
          ja: '?????? => ?????????',
          cn: '?????? => ?????????',
          ko: '?????? => ??? ??? ??????',
        },
      },
    },
    {
      id: 'P3S Firestorms of Asphodelos',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '66F0', source: 'Phoinix', capture: false }),
      response: Responses.bigAoe(),
    },
    {
      id: 'P3S Experimental Ashplume Stacks',
      type: 'Ability',
      // 66C2 cast -> 66C3 stacks damage
      netRegex: NetRegexes.ability({ id: '66C2', source: 'Phoinix', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stacks',
          de: 'Sammeln',
          fr: 'Packez-vous',
          ja: '?????????',
          cn: '??????',
          ko: '??????',
        },
      },
    },
    {
      id: 'P3S Experimental Ashplume Spread',
      type: 'Ability',
      // 66C4 cast -> 66C5 spread damage
      netRegex: NetRegexes.ability({ id: '66C4', source: 'Phoinix', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Spread',
          de: 'Verteilen',
          fr: 'Dispersez-vous',
          ja: '??????',
          cn: '??????',
          ko: '??????',
        },
      },
    },
    {
      id: 'P3S Death\'s Toll Number',
      type: 'GainsEffect',
      netRegex: NetRegexes.gainsEffect({ effectId: ['ACA'], capture: true }),
      // Force this to only run once without Conditions.targetIsYou()
      // in case user is dead but needs to place fledgling flight properly
      preRun: (data) => data.deathsToll = true,
      // Delay callout until Ashen Eye start's casting
      delaySeconds: 15.5,
      infoText: (data, matches, output) => {
        if (matches.target === data.me && !data.deathsTollPending) {
          data.deathsTollPending = true;
          return {
            '01': output.outCardinals!(),
            '02': output.outIntercards!(),
            '04': output.middle!(),
          }[matches.count];
        }
      },
      outputStrings: {
        middle: Outputs.middle,
        outIntercards: {
          en: 'Intercards + Out',
          de: 'Interkardinal + Raus',
          fr: 'Intercadinal + Ext??rieur',
          ja: '?????? + ??????',
          cn: '?????? + ??????',
          ko: '????????? + ??????',
        },
        outCardinals: {
          en: 'Out + Cardinals',
          de: 'Raus + Kardinal',
          fr: 'Ext??rieur + Cardinal',
          ja: '?????? + ??????',
          cn: '?????? + ??????',
          ko: '?????? + ??????',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Left Cinderwing/Right Cinderwing': 'Left/Right Cinderwing',
        'Flare of Condemnation/Sparks of Condemnation': 'Flare/Sparks of Condemnation',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Darkblaze Twister': 'Schwarzlohensturm',
        'Fountain of Fire': 'Quell des Feuers',
        'Phoinix': 'Phoinix',
        'Sparkfledged': 'Saat des Phoinix',
        'Sunbird': 'Spross des Phoinix',
      },
      'replaceText': {
        '--fire expands--': '--Feuer breitet sich aus--',
        '--giant fireplume\\?--': '--riesige Feuerfieder?--',
        'Ashen Eye': 'Aschener Blick',
        '(?<!\\w )Ashplume': 'Aschenfieder',
        'Beacons of Asphodelos': 'Asphodeische Flamme',
        'Blazing Rain': 'Flammender Regen',
        'Brightened Fire': 'Lichte Lohe',
        'Burning Twister': 'Lohenwinde',
        'Dark Twister': 'Schwarze Winde',
        'Darkblaze Twister': 'Schwarzlohensturm',
        'Darkened Fire': 'Schwarze Lohe',
        'Dead Rebirth': 'Melaphoinix',
        'Death\'s Toll': 'Eid des Abschieds',
        'Devouring Brand': 'Kreuzbrand',
        'Experimental Ashplume': 'Experimentelle Aschenfieder',
        'Experimental Fireplume': 'Experimentelle Feuerfieder',
        'Experimental Gloryplume': 'Experimentelle Prachtfieder',
        'Final Exaltation': 'Ewige Asche',
        'Fireglide Sweep': 'Gleitjagd',
        'Firestorms of Asphodelos': 'Asphodeischer Feuersturm',
        'Flames of Asphodelos': 'Asphodeisches Feuer',
        'Flames of Undeath': 'Totenflamme',
        'Flare of Condemnation': 'Limbische Flamme',
        'Fledgling Flight': 'Fl??ggewerden',
        'Fountain of Death': 'Quell des Todes',
        'Fountain of Fire': 'Quell des Feuers',
        '(?<!\\w )Gloryplume': 'Prachtfieder',
        'Great Whirlwind': 'Windhose',
        'Heat of Condemnation': 'Limbisches Lodern',
        'Joint Pyre': 'Gemeinschaft des Feuers',
        'Left Cinderwing': 'Linke Aschenschwinge',
        'Life\'s Agonies': 'Lohen des Lebens',
        'Right Cinderwing': 'Rechte Aschenschwinge',
        'Scorched Exaltation': 'Aschenlohe',
        'Searing Breeze': 'Sengender Hauch',
        'Sparks of Condemnation': 'Limbische Glut',
        '(?<!fire)Storms of Asphodelos': 'Asphodeischer Sturm',
        'Sun\'s Pinion': 'Schwelende Schwinge',
        'Trail of Condemnation': 'Limbischer Odem',
        'Winds of Asphodelos': 'Asphodeische Winde',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Darkblaze Twister': 'Tourbillon enflamm?? des Limbes',
        'Fountain of Fire': 'Flamme de la vie',
        'Phoinix': 'protoph??nix',
        'Sparkfledged': 'oiselet de feu',
        'Sunbird': 'oiselet ??tincelant',
      },
      'replaceText': {
        '\\?': ' ?',
        '--fire expands--': '--??largissement du feu--',
        '--giant fireplume': '--immolation de feu g??ant',
        'Ashen Eye': '??il sombre',
        '(?<!\\w )Ashplume': 'Immolation de feu t??n??breux',
        'Beacons of Asphodelos': 'Feu des Limbes',
        'Blazing Rain': 'Pluie br??lante',
        'Brightened Fire': 'Flamme de lumi??re',
        'Burning Twister': 'Tourbillon enflamm??',
        'Dark Twister': 'Tourbillon sombre',
        'Darkblaze Twister': 'Tourbillon enflamm?? des Limbes',
        'Darkened Fire': 'Flamme sombre',
        'Dead Rebirth': 'Ph??nix noir',
        'Death\'s Toll': 'Destin mortel',
        'Devouring Brand': 'Croix enflamm??e',
        'Experimental Ashplume': 'Synth??se de mana : immolation de feu t??n??breux',
        'Experimental Fireplume': 'Synth??se de mana : immolation de feu',
        'Experimental Gloryplume': 'Synth??se de mana : feu des profondeurs',
        'Final Exaltation': 'Conflagration calcinante',
        'Fireglide Sweep': 'Plongeons en cha??ne',
        'Firestorms of Asphodelos': 'Volcan des Limbes',
        'Flames of Asphodelos': 'Flamme des Limbes',
        'Flames of Undeath': 'Feu r??incarn??',
        'Flare of Condemnation/Sparks of Condemnation': 'Souffle/Artifice infernal',
        'Fledgling Flight': 'Nu??e ail??e',
        'Fountain of Death': 'Onde de la vie',
        'Fountain of Fire': 'Flamme de la vie',
        '(?<!\\w )Gloryplume': 'Feu des profondeurs',
        'Great Whirlwind': 'Grand tourbillon',
        'Heat of Condemnation': 'Bourrasque infernale',
        'Joint Pyre': 'Combustion r??sonnante',
        'Left Cinderwing/Right Cinderwing': 'Incin??ration senestre/dextre',
        'Life\'s Agonies': 'Flamme de souffrance',
        'Scorched Exaltation': 'Flamme calcinante',
        'Searing Breeze': 'Jet incandescent',
        '(?<!fire)Storms of Asphodelos': 'Temp??te des Limbes',
        'Sun\'s Pinion': 'Ailes ??tincelantes',
        'Trail of Condemnation': 'Embrasement infernal',
        'Winds of Asphodelos': 'Temp??te des Limbes',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Darkblaze Twister': '?????????????????????',
        'Fountain of Fire': '????????????',
        'Phoinix': '???????????????',
        'Sparkfledged': '?????????',
        'Sunbird': '?????????',
      },
      'replaceText': {
        'Ashen Eye': '?????????',
        '(?<!\\w )Ashplume': '?????????????????????',
        'Beacons of Asphodelos': '????????????',
        'Blazing Rain': '?????????',
        'Brightened Fire': '?????????',
        'Burning Twister': '?????????',
        'Dark Twister': '?????????',
        'Darkblaze Twister': '?????????????????????',
        'Darkened Fire': '?????????',
        'Dead Rebirth': '???????????????',
        'Death\'s Toll': '????????????',
        'Devouring Brand': '????????????',
        'Experimental Ashplume': '????????????????????????????????????',
        'Experimental Fireplume': '???????????????????????????',
        'Experimental Gloryplume': '???????????????????????????',
        'Final Exaltation': '???????????????',
        'Fireglide Sweep': '??????????????????',
        'Firestorms of Asphodelos': '???????????????',
        'Flames of Asphodelos': '????????????',
        'Flames of Undeath': '????????????',
        'Flare of Condemnation': '???????????????',
        'Fledgling Flight': '????????????',
        'Fountain of Death': '???????????????',
        'Fountain of Fire': '????????????',
        '(?<!\\w )Gloryplume': '????????????',
        'Great Whirlwind': '?????????',
        'Heat of Condemnation': '???????????????',
        'Joint Pyre': '??????',
        'Left Cinderwing': '????????????',
        'Life\'s Agonies': '????????????',
        'Right Cinderwing': '????????????',
        'Scorched Exaltation': '????????????',
        'Searing Breeze': '?????????',
        'Sparks of Condemnation': '???????????????',
        '(?<!fire)Storms of Asphodelos': '????????????',
        'Sun\'s Pinion': '????????????',
        'Trail of Condemnation': '????????????',
        'Winds of Asphodelos': '????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Darkblaze Twister': '??????????????????',
        'Fountain of Fire': '????????????',
        'Phoinix': '????????????',
        'Sparkfledged': '?????????',
        'Sunbird': '?????????',
      },
      'replaceText': {
        '--fire expands--': '--????????????--',
        '--giant fireplume\\?--': '--?????????????--',
        'Ashen Eye': '?????????',
        '(?<!\\w )Ashplume': '??????????????????',
        'Beacons of Asphodelos': '????????????',
        'Blazing Rain': '?????????',
        'Brightened Fire': '?????????',
        'Burning Twister': '?????????',
        'Dark Twister': '?????????',
        'Darkblaze Twister': '??????????????????',
        'Darkened Fire': '?????????',
        'Dead Rebirth': '???????????????',
        'Death\'s Toll': '???????????????',
        'Devouring Brand': '????????????',
        'Experimental Ashplume': '?????????????????????????????????',
        'Experimental Fireplume': '???????????????????????????',
        'Experimental Gloryplume': '???????????????????????????',
        'Final Exaltation': '????????????',
        'Fireglide Sweep': '??????????????????',
        'Firestorms of Asphodelos': '??????????????????',
        'Flames of Asphodelos': '????????????',
        'Flames of Undeath': '????????????',
        'Flare of Condemnation': '????????????',
        'Fledgling Flight': '????????????',
        'Fountain of Death': '???????????????',
        'Fountain of Fire': '????????????',
        '(?<!\\w )Gloryplume': '????????????',
        'Great Whirlwind': '?????????',
        'Heat of Condemnation': '????????????',
        'Joint Pyre': '??????',
        'Left Cinderwing': '????????????',
        'Life\'s Agonies': '????????????',
        'Right Cinderwing': '????????????',
        'Scorched Exaltation': '????????????',
        'Searing Breeze': '?????????',
        'Sparks of Condemnation': '????????????',
        '(?<!fire)Storms of Asphodelos': '????????????',
        'Sun\'s Pinion': '????????????',
        'Trail of Condemnation': '????????????',
        'Winds of Asphodelos': '????????????',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Darkblaze Twister': '???????????? ?????????',
        'Fountain of Fire': '????????? ??????',
        'Phoinix': '?????????',
        'Sparkfledged': '?????????',
        'Sunbird': '?????????',
      },
      'replaceText': {
        '--fire expands--': '--????????? ??????--',
        '--giant fireplume\\?--': '--?????? ???????--',
        'Ashen Eye': '????????? ?????????',
        '(?<!\\w )Ashplume': '????????? ????????????',
        'Beacons of Asphodelos': '????????? ???',
        'Blazing Rain': '??????',
        'Brightened Fire': '?????? ??????',
        'Burning Twister': '?????? ?????????',
        'Dark Twister': '?????? ?????????',
        'Darkblaze Twister': '????????? ???????????? ?????????',
        'Darkened Fire': '????????? ??????',
        'Dead Rebirth': '?????? ?????????',
        'Death\'s Toll': '????????? ??????',
        'Devouring Brand': '?????? ??????',
        'Experimental Ashplume': '?????? ??????: ????????? ????????????',
        'Experimental Fireplume': '?????? ??????: ????????????',
        'Experimental Gloryplume': '?????? ??????: ????????????',
        'Final Exaltation': '????????? ?????????',
        'Fireglide Sweep': '?????? ?????? ??????',
        'Firestorms of Asphodelos': '????????? ?????? ??????',
        'Flames of Asphodelos': '????????? ??????',
        'Flames of Undeath': '????????? ??????',
        'Flare of Condemnation/Sparks of Condemnation': '????????? ??????/??????',
        'Fledgling Flight': '?????? ??????',
        'Fountain of Death': '????????? ??????',
        'Fountain of Fire': '????????? ??????',
        '(?<!\\w )Gloryplume': '????????????',
        'Great Whirlwind': '?????????',
        'Heat of Condemnation': '????????? ??????',
        'Joint Pyre': '?????? ??????',
        'Left Cinderwing/Right Cinderwing': '???/???????????? ??????',
        'Life\'s Agonies': '????????? ??????',
        'Scorched Exaltation': '????????? ??????',
        'Searing Breeze': '??? ??????',
        '(?<!fire)Storms of Asphodelos': '????????? ??????',
        'Sun\'s Pinion': '????????? ??????',
        'Trail of Condemnation': '????????? ??????',
        'Winds of Asphodelos': '????????? ??????',
      },
    },
  ],
};

export default triggerSet;
