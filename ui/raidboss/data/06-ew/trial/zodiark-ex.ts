import NetRegexes from '../../../../../resources/netregexes';
import Outputs from '../../../../../resources/outputs';
import { callOverlayHandler } from '../../../../../resources/overlay_plugin_api';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: The second middle/sides laser after Astral Eclipse should be
// called only after the first goes off.

export interface Data extends RaidbossData {
  activeSigils: { x: number; y: number; typeId: string; npcId: string }[];
  activeFrontSigils: { x: number; y: number; typeId: string; npcId: string }[];
  paradeigmaCounter: number;
  seenAdikia: boolean;
  styxCount: number;
}

const sigil = {
  greenBeam: '67E4',
  redBox: '67E5',
  blueCone: '67E6',
} as const;

const fetchCombatantsById = async (id: string[]) => {
  const decIds = [];
  for (const i of id)
    decIds.push(parseInt(i, 16));
  const callData = await callOverlayHandler({
    call: 'getCombatants',
    ids: decIds,
  });
  return callData.combatants;
};

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.TheMinstrelsBalladZodiarksFall,
  timelineFile: 'zodiark-ex.txt',
  initData: () => ({
    activeSigils: [],
    activeFrontSigils: [],
    paradeigmaCounter: 0,
    seenAdikia: false,
    styxCount: 6,
  }),
  triggers: [
    {
      id: 'ZodiarkEx Ania',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6B63', source: 'Zodiark' }),
      response: Responses.tankBusterSwap(),
    },
    {
      id: 'ZodiarkEx Kokytos',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '6C60', source: 'Zodiark', capture: false }),
      response: Responses.bigAoe(),
    },
    {
      id: 'ZodiarkEx Paradeigma',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '67BF', source: 'Zodiark', capture: false }),
      alertText: (data, _matches, output) => {
        ++data.paradeigmaCounter;
        if (data.paradeigmaCounter === 1)
          return output.underQuetz!();
      },
      outputStrings: {
        underQuetz: {
          en: 'Under NW Quetzalcoatl',
          de: 'Unter NW Quetzalcoatl',
          cn: '???????????? (??????) ???',
          ko: '????????? ??? ?????????', // This is northeast. Because Korean folks go there.
        },
      },
    },
    {
      id: 'ZodiarkEx Styx',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '67F3', source: 'Zodiark', capture: false }),
      alertText: (data, _matches, output) => output.text!({ num: data.styxCount }),
      run: (data) => data.styxCount = Math.min(data.styxCount + 1, 9),
      outputStrings: {
        text: {
          en: 'Stack x${num}',
          de: 'Sammeln x${num}',
          cn: '${num}?????????',
          ko: '?????? ${num}???',
        },
      },
    },
    {
      id: 'ZodiarkEx Arcane Sigil End',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: [sigil.greenBeam, sigil.redBox, sigil.blueCone], source: 'Arcane Sigil' }),
      run: (data, matches, _output) => {
        for (let i = 0; i < data.activeSigils.length; ++i) {
          const sig = data.activeSigils[i];
          if (sig?.npcId === matches.sourceId)
            data.activeSigils.splice(i, 1);
        }
      },
    },
    {
      id: 'ZodiarkEx Blue Cone Tether',
      type: 'Tether',
      netRegex: NetRegexes.tether({ id: '00A4', source: 'Zodiark' }),
      promise: async (data, matches) => {
        const portalActors = await fetchCombatantsById([matches.targetId]);
        for (const actor of portalActors) {
          if (actor.ID)
            data.activeSigils.push({ x: actor.PosX, y: actor.PosY, typeId: sigil.blueCone, npcId: actor.ID.toString(16).toUpperCase() });
        }
      },
      alertText: (data, matches, output) => {
        const target = data.activeSigils[data.activeSigils.length - 1];
        if (!target) {
          console.error(`Blue Tether: Missing target, ${JSON.stringify(matches)}`);
          return;
        }

        if (target.x < 100)
          return output.westCone!();

        if (target.x > 100)
          return output.eastCone!();

        if (target.y < 100)
          return output.northCone!();
        return output.southCone!();
      },
      outputStrings: {
        northCone: {
          en: 'North Cone',
          de: 'N??rdliche Kegel-AoE',
          cn: '??? (???) ??????',
          ko: '?????? ?????????',
        },
        eastCone: {
          en: 'East Cone',
          de: '??stliche Kegel-AoE',
          cn: '??? (???) ??????',
          ko: '?????? ?????????',
        },
        westCone: {
          en: 'West Cone',
          de: 'Westliche Kegel-AoE',
          cn: '??? (???) ??????',
          ko: '?????? ?????????',
        },
        southCone: {
          en: 'South Cone',
          de: 'S??dliche Kegel-AoE',
          cn: '??? (???) ??????',
          ko: '?????? ?????????',
        },
      },
    },
    {
      id: 'ZodiarkEx Red Box Tether',
      type: 'Tether',
      netRegex: NetRegexes.tether({ id: '00AB', source: 'Zodiark' }),
      promise: async (data, matches) => {
        const portalActors = await fetchCombatantsById([matches.targetId]);
        for (const actor of portalActors) {
          if (actor.ID)
            data.activeSigils.push({ x: actor.PosX, y: actor.PosY, typeId: sigil.redBox, npcId: actor.ID.toString(16).toUpperCase() });
        }
      },
      alertText: (data, matches, output) => {
        const target = data.activeSigils[data.activeSigils.length - 1];
        if (!target) {
          console.error(`Red Tether: Missing target, ${JSON.stringify(matches)}`);
          return;
        }

        if (target.x < 100)
          return output.east!();

        if (target.x > 100)
          return output.west!();

        if (target.y < 100)
          return output.south!();
        return output.north!();
      },
      outputStrings: {
        north: Outputs.north,
        west: Outputs.west,
        south: Outputs.south,
        east: Outputs.east,
      },
    },
    {
      id: 'ZodiarkEx Roiling Darkness Spawn',
      type: 'AddedCombatant',
      netRegex: NetRegexes.addedCombatant({ name: 'Roiling Darkness', capture: false }),
      suppressSeconds: 1,
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: Outputs.killAdds.en + '(back first)',
          de: Outputs.killAdds.de + '(hinten zuerst)',
          cn: Outputs.killAdds.cn + '(???????????????)',
          ko: Outputs.killAdds.ko + '(????????? ??????)',
        },
      },
    },
    {
      id: 'ZodiarkEx Arcane Sigil Start',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: [sigil.greenBeam, sigil.redBox, sigil.blueCone], source: 'Arcane Sigil' }),
      run: (data, matches, _output) => {
        if (parseFloat(matches.y) < 100)
          data.activeFrontSigils.push({ x: parseFloat(matches.x), y: parseFloat(matches.y), typeId: matches.id, npcId: matches.sourceId });
      },
    },
    {
      id: 'ZodiarkEx Arcane Sigil',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: [sigil.greenBeam, sigil.redBox, sigil.blueCone], source: 'Arcane Sigil', capture: false }),
      delaySeconds: 0.2,
      suppressSeconds: 0.5,
      alertText: (data, _matches, output) => {
        const activeFrontSigils = data.activeFrontSigils;
        data.activeFrontSigils = [];
        if (activeFrontSigils.length === 1 && activeFrontSigils[0]?.typeId === sigil.greenBeam)
          return output.sides!();
        if (activeFrontSigils.length === 1 && activeFrontSigils[0]?.typeId === sigil.redBox)
          return output.south!();
        if (activeFrontSigils.length === 1 && activeFrontSigils[0]?.typeId === sigil.blueCone)
          return output.north!();
        if (activeFrontSigils.length === 2 && activeFrontSigils[0]?.typeId === sigil.greenBeam && activeFrontSigils[1]?.typeId === sigil.greenBeam)
          return output.middle!();
        if (activeFrontSigils.length === 3) {
          for (const sig of activeFrontSigils) {
            // Find the middle sigil
            if (sig.x > 90 && sig.x < 110) {
              if (sig.typeId === sigil.greenBeam)
                return output.frontsides!();
              if (sig.typeId === sigil.redBox)
                return output.backmiddle!();
              if (sig.typeId === sigil.blueCone)
                return output.frontmiddle!();
            }
          }
        }
      },
      outputStrings: {
        south: Outputs.south,
        north: Outputs.north,
        frontsides: {
          en: 'front sides',
          de: 'Vorne Seiten',
          cn: '????????????',
          ko: '?????? ??????',
        },
        backmiddle: {
          en: 'back middle',
          de: 'Hinten Mitte',
          cn: '????????????',
          ko: '?????? ??????',
        },
        frontmiddle: {
          en: 'front middle',
          de: 'Vorne Mitte',
          cn: '????????????',
          ko: '?????? ??????',
        },
        sides: {
          // Specify "for laser" to disambiguate with the astral eclipse going on at the same time.
          // Similarly, there's a algodon knockback call too.
          en: 'sides (for laser)',
          de: 'Seiten (f??r die Laser)',
          cn: '?????? (????????????)',
          ko: '?????? (????????? ?????????)',
        },
        middle: {
          en: 'middle (for laser)',
          de: 'Mitte (f??r die Laser)',
          cn: '?????? (????????????)',
          ko: '?????? (????????? ?????????)',
        },
      },
    },
    {
      // 67EC is leaning left, 67ED is leaning right
      id: 'ZodiarkEx Algedon',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: ['67EC', '67ED'], source: 'Zodiark' }),
      alertText: (_data, matches, output) => {
        if (matches.id === '67EC') {
          // NE/SW
          return output.combo!({ first: output.northeast!(), second: output.southwest!() });
        }
        if (matches.id === '67ED') {
          // NW/SE
          return output.combo!({ first: output.northwest!(), second: output.southeast!() });
        }
      },
      outputStrings: {
        northeast: Outputs.dirNE,
        northwest: Outputs.dirNW,
        southeast: Outputs.dirSE,
        southwest: Outputs.dirSW,
        combo: {
          en: 'Go ${first} / ${second} (knockback)',
          de: 'Geh ${first} / ${second} (R??cksto??)',
          cn: '??? ${first} / ${second} (??????)',
          ko: '${first} / ${second} (??????)',
        },
      },
    },
    {
      id: 'ZodiarkEx Adikia',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '63A9', source: 'Zodiark', capture: false }),
      alertText: (data, _matches, output) => {
        return data.seenAdikia ? output.adikia2!() : output.adikia1!();
      },
      run: (data) => data.seenAdikia = true,
      outputStrings: {
        adikia1: {
          en: 'Double fists (look for pythons)',
          de: 'Doppel-F??uste (halt Ausschau nach den Pythons)',
          cn: '?????? (??????)',
          ko: '??? ??? ??? ?????? ?????? (??? ?????? ??????)',
        },
        adikia2: {
          en: 'Double fists',
          de: 'Doppel-F??uste',
          cn: '??????',
          ko: '??? ??? ??? ?????? ??????',
        },
      },
    },
    {
      id: 'ZodiarkEx Phobos',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '67F0', source: 'Zodiark', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Heavy DoT',
          de: 'Starker DoT',
          cn: '????????????AOE',
          ko: '?????? ?????????',
        },
      },
    },
  ],
  timelineReplace: [
    {
      'locale': 'en',
      'replaceText': {
        'Esoteric Dyad/Esoteric Sect': 'Esoteric Dyad/Sect',
      },
    },
    {
      'locale': 'de',
      'replaceSync': {
        'Arcane Sigil': 'Geheimzeichen',
        'Behemoth': 'Behemoth',
        'Quetzalcoatl': 'Quetzalcoatl',
        'Roiling Darkness': 'Strom der Dunkelheit',
        'Zodiark': 'Zodiark',
        'python': 'Python',
      },
      'replaceText': {
        'Adikia': 'Adikia',
        'Algedon': 'Algedon',
        'Ania': 'Ania',
        'Apomnemoneumata': 'Apomnemoneumata',
        'Astral Eclipse': 'Astraleklipse',
        'Astral Flow': 'Lichtstrom',
        'Esoteric Dyad': 'Esoterische Dyade',
        'Esoteric Pattern': 'Esoteric Muster',
        '(?<!Triple )Esoteric Ray': 'Esoterischer Strahl',
        'Esoteric Sect': 'Esoterische Sekte',
        'Esoterikos': 'Esoterikos',
        '(?<!Trimorphos )Exoterikos': 'Exoterikos',
        'Explosion': 'Explosion',
        'Infernal Stream': 'Infernostrom',
        'Infernal Torrent': 'Infernaler Strom',
        'Keraunos Eidolon': 'Keraunos',
        'Kokytos': 'Kokytos',
        'Meteoros Eidolon': 'Meteoros',
        'Opheos Eidolon': 'Opheos',
        'Paradeigma': 'Paradeigma',
        'Phlegethon': 'Phlegethon',
        'Phobos': 'Phobos',
        'Styx': 'Styx',
        'Trimorphos Exoterikos': 'Trimorphos Exoterikos',
        'Triple Esoteric Ray': 'Esoterischer Dreierstrahl',
      },
    },
    {
      'locale': 'fr',
      'replaceSync': {
        'Arcane Sigil': 'embl??me secret',
        'Behemoth': 'b??h??moth',
        'Quetzalcoatl': 'Quetzalc??atl',
        'Roiling Darkness': 'orbe des T??n??bres',
        'Zodiark': 'Zordiarche',
        'python': 'Python',
      },
      'replaceText': {
        'Adikia': 'Adikia',
        'Algedon': 'Algedon',
        'Ania': 'Ania',
        'Apomnemoneumata': 'Apomnemoneumata',
        'Astral Eclipse': '??clipse astrale',
        'Astral Flow': 'Flux astral',
        'Esoteric Dyad(?!/)': 'Dyade ??sot??rique',
        'Esoteric Dyad/Esoteric Sect': 'Dyade/Cabale ??sot??rique',
        '(?<!Triple )Esoteric Ray': 'Rayon ??sot??rique',
        '(?<!/)Esoteric Sect': 'Cabale ??sot??rique',
        'Esoteric Pattern': 'Sch??ma ??sot??rique',
        'Esoterikos': 'Esoterikos',
        '(?<!Trimorphos )Exoterikos': 'Exoterikos',
        'Explosion': 'Explosion',
        'Infernal Stream': 'Courant infernal',
        'Infernal Torrent': 'Torrent infernal',
        'Keraunos Eidolon': 'Keraunos',
        'Kokytos': 'Kokytos',
        'Meteoros Eidolon': 'Meteoros',
        'Opheos Eidolon': 'Opheos',
        'Paradeigma': 'Paradeigma',
        'Phlegethon': 'Phl??g??thon',
        'Phobos': 'Phobos',
        'Styx': 'Styx',
        'Trimorphos Exoterikos': 'Trimorphos Exoterikos',
        'Triple Esoteric Ray': 'Rayon ??sot??rique triple',
      },
    },
    {
      'locale': 'ja',
      'replaceSync': {
        'Arcane Sigil': '??????',
        'Behemoth': '???????????????',
        'Quetzalcoatl': '????????????????????????',
        'Roiling Darkness': '????????????',
        'Zodiark': '??????????????????',
        'python': '????????????',
      },
      'replaceText': {
        'Adikia': '???????????????',
        'Algedon': '???????????????',
        'Ania': '?????????',
        'Apomnemoneumata': '??????????????????????????????',
        'Astral Eclipse': '??????????????????????????????',
        'Astral Flow': '????????????????????????',
        'Esoteric Dyad': '??????????????????????????????',
        'Esoteric Pattern': '????????????',
        '(?<!Triple )Esoteric Ray': '????????????????????????',
        'Esoteric Sect': '???????????????????????????',
        'Esoterikos': '?????????????????????',
        '(?<!Trimorphos )Exoterikos': '????????????????????????',
        'Explosion': '??????',
        'Infernal Stream': '?????????????????????????????????',
        'Infernal Torrent': '??????????????????????????????',
        'Keraunos Eidolon': '?????????????????????????????????',
        'Kokytos': '??????????????????',
        'Meteoros Eidolon': '?????????????????????????????????',
        'Opheos Eidolon': '?????????????????????????????????',
        'Paradeigma': '??????????????????',
        'Phlegethon': '???????????????',
        'Phobos': '????????????',
        'Styx': '???????????????',
        'Trimorphos Exoterikos': '????????????????????????????????????',
        'Triple Esoteric Ray': '????????????????????????????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Arcane Sigil': '??????',
        'Behemoth': '????????????',
        'Quetzalcoatl': '?????????????????????',
        'Roiling Darkness': '????????????',
        'Zodiark': '????????????',
        'python': '??????',
      },
      'replaceText': {
        'Adikia': '??????',
        'Algedon': '??????',
        'Ania': '??????',
        'Apomnemoneumata': '??????',
        'Astral Eclipse': '??????',
        'Astral Flow': '????????????',
        'Esoteric Dyad': '????????????',
        'Esoteric Pattern': '????????????',
        '(?<!Triple )Esoteric Ray': '????????????',
        'Esoteric Sect': '????????????',
        'Esoterikos': '??????',
        '(?<!Trimorphos )Exoterikos': '??????',
        'Explosion': '??????',
        'Infernal Stream': '????????????',
        'Infernal Torrent': '????????????',
        'Keraunos Eidolon': '????????????',
        'Kokytos': '??????',
        'Meteoros Eidolon': '????????????',
        'Opheos Eidolon': '????????????',
        'Paradeigma': '??????',
        'Phlegethon': '??????',
        'Phobos': '??????',
        'Styx': '??????',
        'Trimorphos Exoterikos': '????????????',
        'Triple Esoteric Ray': '??????????????????',
      },
    },
    {
      'locale': 'ko',
      'replaceSync': {
        'Arcane Sigil': '??????',
        'Behemoth': '????????????',
        'Quetzalcoatl': '???????????????',
        'Roiling Darkness': '????????? ??????',
        'Zodiark': '????????????',
        'python': '??????',
      },
      'replaceText': {
        'Adikia': '??????',
        'Algedon': '??????',
        'Ania': '??????',
        'Apomnemoneumata': '?????????',
        'Astral Eclipse': '????????? ???',
        'Astral Flow': '????????? ??????',
        'Esoteric Dyad(?!/)': '????????? ??????',
        'Esoteric Dyad/Esoteric Sect': '????????? ??????/??????',
        '(?<!/)Esoteric Sect': '????????? ??????',
        'Esoteric Pattern': '????????? ??????/??????/??????',
        'Esoterikos': '??????????????????',
        'Explosion': '??????',
        'Infernal Stream': '????????? ??????',
        'Infernal Torrent': '????????? ??????',
        'Keraunos Eidolon': '????????? ??????',
        'Kokytos': '????????????',
        'Meteoros Eidolon': '????????? ??????',
        'Opheos Eidolon': '????????? ???',
        'Paradeigma': '??????',
        'Phlegethon': '????????????',
        'Phobos': '?????????',
        'Styx': '?????????',
        'Trimorphos Exoterikos': '?????? ??????????????????',
        'Triple Esoteric Ray': '????????? ?????? ??????',
        '(?<!Triple )Esoteric Ray': '????????? ??????',
        '(?<!Trimorphos )Exoterikos': '??????????????????',
      },
    },
  ],
};

export default triggerSet;
