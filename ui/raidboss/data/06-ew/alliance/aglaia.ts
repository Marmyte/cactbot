import Conditions from '../../../../../resources/conditions';
import NetRegexes from '../../../../../resources/netregexes';
import Outputs from '../../../../../resources/outputs';
import { Responses } from '../../../../../resources/responses';
import ZoneId from '../../../../../resources/zone_id';
import { RaidbossData } from '../../../../../types/data';
import { TriggerSet } from '../../../../../types/trigger';

// TODO: Byregot Levinforge
// TODO: Byregot Spire
// TODO: Emissary Destructive Charge quadrants
// TODO: figure out Rhalgr portal sides so we can call left/right/NW/NE
// TODO: are there missing rhalgr portal ability ids?
// TODO: Lions 180 cleaves (is there a call there?)
// TODO: Azeyma Solar Wings, does it need a watch rotation warning?
// TODO: Azeyma Solar Flare warning
// TODO: Azeyma count Radiant Rhythms and call safe direction (or is it fixed?)
// TODO: Azeyma haute air safe quadrant(s)
// TODO: Azeyma Wildfire Ward triangle triggers
// TODO: Nald'Thal Fired Up I/II/III

export interface Data extends RaidbossData {
  rhalgrSeenBeacon?: boolean;
  rhalgrBrokenWorldActive?: boolean;
  tankbusters: string[];
  naldSmeltingSpread: string[];
  naldArrowMarker: string[];
  naldLastColor?: 'orange' | 'blue';
}

const triggerSet: TriggerSet<Data> = {
  zoneId: ZoneId.Aglaia,
  timelineFile: 'aglaia.txt',
  initData: () => {
    return {
      tankbusters: [],
      naldSmeltingSpread: [],
      naldArrowMarker: [],
    };
  },
  triggers: [
    {
      id: 'Aglaia Byregot Ordeal of Thunder',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7176', source: 'Byregot', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Byregot Byregot\'s Strike',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '725A', source: 'Byregot', capture: false }),
      response: Responses.knockback('info'),
    },
    {
      id: 'Aglaia Byregot Byregot\'s Strike Lightning',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7167', source: 'Byregot', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Knockback (with lightning)',
          de: 'R??cksto?? (mit Blitzen)',
          fr: 'Pouss??e (avec ??clair)',
          cn: '?????? (?????????)',
          ko: '?????? (?????? ??????)',
        },
      },
    },
    {
      id: 'Aglaia Byregot Byregot\'s Ward',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7175', source: 'Byregot' }),
      response: Responses.tankCleave(),
    },
    {
      id: 'Aglaia Byregot Reproduce',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '716B', source: 'Byregot', capture: false }),
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Dodge normal -> glowing row',
          de: 'Normal ausweichen -> leuchtende Reihe',
          fr: '??vitez normal -> ligne brillante',
          cn: '???????????? -> ?????????',
          ko: '?????? ?????? -> ????????? ??? ?????????',
        },
      },
    },
    {
      id: 'Aglaia Rhalgr\'s Emissary Destructive Static',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70E0', source: 'Rhalgr\'s Emissary', capture: false }),
      response: Responses.getBehind(),
    },
    {
      id: 'Aglaia Rhalgr\'s Emissary Bolts from the Blue',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70E3', source: 'Rhalgr\'s Emissary', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Rhalgr\'s Emissary Destructive Strike',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70D9', source: 'Rhalgr\'s Emissary' }),
      response: Responses.tankCleave(),
    },
    {
      id: 'Aglaia Rhalgr Lightning Reign',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A5', source: 'Rhalgr', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Rhalgr Destructive Bolt Collect',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70B4', source: 'Rhalgr' }),
      run: (data, matches) => data.tankbusters.push(matches.target),
    },
    {
      id: 'Aglaia Rhalgr Destructive Bolt',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70B4', source: 'Rhalgr', capture: false }),
      delaySeconds: 0.3,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaves: {
            en: 'Avoid Tank Cleaves',
            de: 'Weiche Tank-Cleaves aus',
            fr: '??vitez le cleave sur le tank',
            cn: '??????????????????',
            ko: '?????? ??????',
          },
        };

        if (data.tankbusters.includes(data.me))
          return { alertText: output.tankCleaveOnYou!() };
        return { infoText: output.tankCleaves!() };
      },
      run: (data) => data.tankbusters = [],
    },
    {
      id: 'Aglaia Rhalgr Rhalgr\'s Beacon',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70B8', source: 'Rhalgr', capture: false }),
      // 10 second cast.
      delaySeconds: 5,
      alertText: (data, _matches, output) => {
        return data.rhalgrSeenBeacon ? output.knockbackOrbs!() : output.knockback!();
      },
      run: (data) => data.rhalgrSeenBeacon = true,
      outputStrings: {
        knockback: Outputs.knockback,
        knockbackOrbs: {
          en: 'Knockback (avoid orbs)',
          de: 'R??cksto??s (weiche den Orbs aus)',
          fr: 'Pouss??e (??vitez les orbes)',
          cn: '?????? (?????????)',
          ko: '?????? (?????? ?????????)',
        },
      },
    },
    {
      id: 'Aglaia Rhalgr Lightning Storm',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70BA', source: 'Rhalgr' }),
      condition: Conditions.targetIsYou(),
      response: Responses.spread(),
    },
    {
      id: 'Aglaia Rhalgr Broken World',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A6', source: 'Rhalgr', capture: false }),
      run: (data) => data.rhalgrBrokenWorldActive = true,
    },
    {
      id: 'Aglaia Rhalgr Broken World Cleanup',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A6', source: 'Rhalgr', capture: false }),
      delaySeconds: 20,
      run: (data) => data.rhalgrBrokenWorldActive = false,
    },
    {
      id: 'Aglaia Rhalgr Hand of the Destroyer Blue',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A9', source: 'Rhalgr', capture: false }),
      alertText: (data, _matches, output) => {
        if (data.rhalgrBrokenWorldActive)
          return output.redSideAway!();
        return output.redSide!();
      },
      outputStrings: {
        redSide: {
          en: 'Be on red half',
          de: 'Geh zur roten Seite',
          fr: 'Placez-vous sur la moiti?? rouge',
          cn: '???????????????',
          ko: '?????? ???????????????',
        },
        redSideAway: {
          en: 'Be on red half (away from portal)',
          de: 'Geh zur roten Seite (weg vom Portal)',
          fr: 'Placez-vous sur la moiti?? rouge (loin du portail)',
          cn: '??????????????? (???????????????)',
          ko: '?????? ?????????, ???????????? ?????? ????????????',
        },
      },
    },
    {
      id: 'Aglaia Rhalgr Hand of the Destroyer Red Initial',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A8', source: 'Rhalgr', capture: false }),
      alertText: (_data, _matches, output) => output.blueSide!(),
      outputStrings: {
        blueSide: {
          en: 'Be on blue half',
          de: 'Geh zur blauen Seite',
          fr: 'Placez-vous sur la moiti?? bleue',
          cn: '???????????????',
          ko: '?????? ???????????????',
        },
      },
    },
    {
      id: 'Aglaia Rhalgr Hand of the Destroyer Red',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70AC', source: 'Rhalgr', capture: false }),
      alertText: (_data, _matches, output) => output.nearRed!(),
      outputStrings: {
        nearRed: {
          en: 'Go near red portal',
          de: 'Geh zum roten Portal',
          fr: 'Allez sur le portail rouge',
          cn: '?????????????????????',
          ko: '?????? ?????? ?????????',
        },
      },
    },
    {
      id: 'Aglaia Lions Double Immolation',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7177', source: ['Lion of Aglaia', 'Lioness of Aglaia'], capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Lions Slash and Burn Lioness First',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '71D2', source: 'Lioness of Aglaia', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Under Lioness => Out',
          de: 'Unter L??win => Raus',
          fr: 'Sous la Lionne => Ext??rieur',
          cn: '????????? => ??????',
          ko: '??? => ????????????',
        },
      },
    },
    {
      id: 'Aglaia Lions Slash and Burn Lion First',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '71D0', source: 'Lion of Aglaia', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Out => Under Lioness',
          de: 'Raus => Unter L??win',
          fr: 'Ext??rieur => Sous la lionne',
          cn: '?????? => ?????????',
          ko: '?????? => ?????????',
        },
      },
    },
    {
      id: 'Aglaia Azeyma Warden\'s Prominence',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '70A0', source: 'Azeyma', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Azeyma Solar Wings',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7081', source: 'Azeyma', capture: false }),
      response: Responses.goFrontBack(),
    },
    {
      id: 'Aglaia Azeyma Warden\'s Warmth Collect',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '709F', source: 'Azeyma' }),
      run: (data, matches) => data.tankbusters.push(matches.target),
    },
    {
      id: 'Aglaia Azeyma Warden\'s Warmth',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '709F', source: 'Azeyma', capture: false }),
      delaySeconds: 0.3,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaves: {
            en: 'Avoid Tank Cleaves',
            de: 'Weiche Tank-Cleaves aus',
            fr: '??vitez les cleaves sur le tank',
            cn: '??????????????????',
            ko: '?????? ??????',
          },
        };

        if (data.tankbusters.includes(data.me))
          return { alertText: output.tankCleaveOnYou!() };
        return { infoText: output.tankCleaves!() };
      },
      run: (data) => data.tankbusters = [],
    },
    {
      id: 'Aglaia Azeyma Fleeting Spark',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '709C', source: 'Azeyma', capture: false }),
      response: Responses.getBehind(),
    },
    {
      id: 'Aglaia Azeyma Sublime Sunset',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7098', source: 'Azeyma', capture: false }),
      alertText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Away from Orb',
          de: 'Weg vom Orb',
          fr: '??loignez-vous de l\'orbe',
          cn: '?????????',
          ko: '?????? ?????????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal As Above, So Below',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: ['70E8', '70E9'], source: 'Nald\'thal', capture: false }),
      response: Responses.aoe(),
    },
    {
      id: 'Aglaia Nald\'thal Heat Above, Flames Below Orange Swap',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '73A4', source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      response: Responses.getOut(),
      run: (data) => data.naldLastColor = 'orange',
    },
    {
      id: 'Aglaia Nald\'thal Heat Above, Flames Below Blue',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '73A5', source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      response: Responses.getUnder(),
      run: (data) => data.naldLastColor = 'blue',
    },
    {
      id: 'Aglaia Nald\'thal Smelting',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ id: '00ED' }),
      alertText: (data, matches, output) => {
        if (data.me === matches.target)
          return output.text!();
      },
      run: (data, matches) => data.naldSmeltingSpread.push(matches.target),
      outputStrings: {
        text: {
          en: 'Protean Spread on YOU',
          de: 'Protean verteilen auf DIR',
          fr: 'Position sur VOUS',
          cn: '??????????????????',
          ko: '????????? ?????????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Heavens\' Trial',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '711F', source: ['Thal', 'Nald\'thal'] }),
      alertText: (data, matches, output) => {
        if (data.naldSmeltingSpread.includes(data.me))
          return;
        return output.stackOnPlayer!({ player: data.ShortName(matches.target) });
      },
      run: (data) => data.naldSmeltingSpread = [],
      outputStrings: {
        stackOnPlayer: Outputs.stackOnPlayer,
      },
    },
    {
      id: 'Aglaia Nald\'thal Golden Tenet',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '711B', source: 'Nald\'thal' }),
      response: Responses.sharedTankBuster(),
    },
    {
      // The order of events is either:
      // Deepest Pit headmarker (always) -> Far Above cast -> 73AC ability (always)
      // Deepest Pit headmarker (always) -> 73AC ability (always) -> Far Above cast
      // The 73AC and Far Above cast come from different actors and can be ordered differently.
      // As a hack, 73AC gets a slight delay.  The Deepest Pit and 73AC lines always
      // happen even if they are fake (because it is orange or blue, respectively).
      id: 'Aglaia Nald\'thal Deepest Pit Collect',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ id: '0154' }),
      run: (data, matches) => data.naldArrowMarker.push(matches.target),
    },
    {
      id: 'Aglaia Nald\'thal Far Above, Deep Below Blue',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '73AA', source: 'Nald\'thal', capture: false }),
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          dropMarkerOutside: {
            en: 'Drop marker outside',
            de: 'Marker drau??en ablegen',
            fr: 'D??posez les marqueurs ?? l\'ext??rieur',
            cn: '?????????????????????',
            ko: '??? ????????? ??????',
          },
          ignoreLineStack: {
            en: 'Ignore fake stack',
            de: 'Falsches Sammeln ignorieren',
            fr: 'Ignorez le faux marqueur de package',
            cn: '???????????????',
            ko: '?????? ??? ??????',
          },
        };

        // People with arrow markers should not get a stack callout.
        if (data.naldArrowMarker.includes(data.me))
          return { alertText: output.dropMarkerOutside!() };

        return { infoText: output.ignoreLineStack!() };
      },
      run: (data) => {
        data.naldLastColor = 'blue';
        data.naldArrowMarker = [];
      },
    },
    {
      id: 'Aglaia Nald\'thal Far Above, Deep Below Orange',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '73AB', source: 'Nald\'thal', capture: false }),
      infoText: (data, _matches, output) => {
        if (data.naldArrowMarker.includes(data.me))
          return output.ignoreArrow!();
      },
      run: (data) => {
        data.naldLastColor = 'orange';
        data.naldArrowMarker = [];
      },
      outputStrings: {
        ignoreArrow: {
          en: 'Ignore fake arrow',
          de: 'Falschen Pfeil ignorieren',
          fr: 'Ignorez la fausse fl??che',
          cn: '???????????????',
          ko: '?????? ??? ??????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Far-flung Fire',
      type: 'Ability',
      netRegex: NetRegexes.ability({ id: '73AC', source: 'Nald' }),
      // 73AC sometimes comes before the Far Above, Deep Below cast.
      // It has the exact same network log time, but is just sometimes ordered wrong.
      // Add a slight delay here so the calls end up being correct.
      delaySeconds: 0.5,
      alertText: (data, matches, output) => {
        if (data.naldLastColor === 'orange')
          return output.lineStackOn!({ player: data.ShortName(matches.target) });
      },
      outputStrings: {
        lineStackOn: {
          en: 'Line stack on ${player}',
          de: 'In einer Linie auf ${player} sammeln',
          fr: 'Packez-vous en ligne sur ${player}',
          ja: '${player}??????????????????',
          cn: '${player} ????????????',
          ko: '${player} ?????? ??????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Once Above, Ever Below Orange',
      type: 'StartsUsing',
      // 73BF = starts blue, swaps orange
      // 741D = starts orange, stays orange
      netRegex: NetRegexes.startsUsing({ id: ['73BF', '741D'], source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      alertText: (_data, _matches, output) => output.text!(),
      run: (data) => data.naldLastColor = 'orange',
      outputStrings: {
        text: {
          en: 'Go to Blue Quadrant',
          de: 'Geh zum blauen Quadrant',
          fr: 'Allez sur le quart bleu',
          cn: '??????????????????',
          ko: '?????? ????????????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Once Above, Ever Below Blue',
      type: 'StartsUsing',
      // 73C0 = starts blue, stays blue
      // 741C = starts orange, swaps blue
      netRegex: NetRegexes.startsUsing({ id: ['73C0', '741C'], source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      alertText: (_data, _matches, output) => output.text!(),
      run: (data) => data.naldLastColor = 'blue',
      outputStrings: {
        text: {
          en: 'Go to Orange Quadrant',
          de: 'Geh zum orangenen Quadrant',
          fr: 'Allez sur le quart orange',
          cn: '??????????????????',
          ko: '?????? ????????????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Hell of Fire Front',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '72B7', source: 'Nald\'thal', capture: false }),
      response: Responses.getBehind(),
    },
    {
      id: 'Aglaia Nald\'thal Hell of Fire Back',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '72B9', source: 'Nald\'thal', capture: false }),
      alertText: (_data, _matches, output) => output.goFront!(),
      outputStrings: {
        goFront: Outputs.goFront,
      },
    },
    {
      id: 'Aglaia Nald\'thal Soul Vessel Magmatic Spell',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '712D', source: 'Soul Vessel', capture: false }),
      suppressSeconds: 5,
      infoText: (_data, _matches, output) => output.text!(),
      outputStrings: {
        text: {
          en: 'Stack groups',
          de: 'Sammel Gruppen',
          fr: 'Package en groupe',
          cn: '????????????',
          ko: '????????? ??????',
        },
      },
    },
    {
      id: 'Aglaia Nald\'thal Stygian Tenet Collect',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '711D', source: 'Nald\'thal' }),
      run: (data, matches) => data.tankbusters.push(matches.target),
    },
    {
      id: 'Aglaia Nald\'thal Stygian Tenet',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '711D', source: 'Nald\'thal', capture: false }),
      delaySeconds: 0.3,
      suppressSeconds: 1,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          tankCleaveOnYou: Outputs.tankCleaveOnYou,
          tankCleaves: {
            en: 'Avoid Tank Cleaves',
            de: 'Weiche den Tank-Cleaves aus',
            fr: '??vitez les cleaves sur le tank',
            cn: '??????????????????',
            ko: '?????? ??????',
          },
        };

        if (data.tankbusters.includes(data.me))
          return { alertText: output.tankCleaveOnYou!() };
        return { infoText: output.tankCleaves!() };
      },
      run: (data) => data.tankbusters = [],
    },
    {
      id: 'Aglaia Nald\'thal Hearth Above, Flight Below Blue',
      type: 'StartsUsing',
      // 73CA = start blue, stay blue
      // 73CC = start orange, swap blue
      netRegex: NetRegexes.startsUsing({ id: ['73CA', '73CC'], source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          dropMarkerOutside: {
            en: 'Under => Drop marker outside',
            de: 'Unter ihn => Marker drausen ablegen',
            fr: 'Dessous => D??posez le marqueur ?? l\'ext??rieur',
            cn: 'BOSS?????? => ?????????????????????',
            ko: '?????? ?????? => ??? ????????? ??????',
          },
          ignoreLineStack: {
            en: 'Under (ignore fake stack)',
            de: 'Unter ihn (falsches Sammeln ignorieren)',
            fr: 'Dessous (ignorez le faux package)',
            cn: 'BOSS?????? (???????????????)',
            ko: '?????? ?????? (?????? ??? ??????)',
          },
        };

        // People with arrow markers should not get a stack callout.
        if (data.naldArrowMarker.includes(data.me))
          return { alertText: output.dropMarkerOutside!() };

        return { infoText: output.ignoreLineStack!() };
      },
      run: (data) => {
        data.naldLastColor = 'blue';
        data.naldArrowMarker = [];
      },
    },
    {
      id: 'Aglaia Nald\'thal Hearth Above, Flight Below Orange',
      type: 'StartsUsing',
      // 73CB = orange, unknown if swap
      // 741B = orange, unknown if swap
      netRegex: NetRegexes.startsUsing({ id: ['73CB', '741B'], source: 'Nald\'thal', capture: false }),
      durationSeconds: 6,
      // Use info here to not conflict with the 73AC line stack trigger.
      infoText: (data, _matches, output) => {
        if (data.naldArrowMarker.includes(data.me))
          return output.ignoreArrow!();
        return output.out!();
      },
      run: (data) => data.naldLastColor = 'orange',
      outputStrings: {
        ignoreArrow: {
          en: 'Out (ignore fake arrow)',
          de: 'Raus (falschen Pfeil ignorieren)',
          fr: 'Ext??rieur (ignorez la fausse fl??che)',
          cn: '????????? (???????????????)',
          ko: '???????????? (?????? ??? ??????)',
        },
        out: Outputs.out,
      },
    },
    {
      id: 'Aglaia Nald\'thal Hells\' Trial',
      type: 'StartsUsing',
      netRegex: NetRegexes.startsUsing({ id: '7121', source: 'Nald\'thal', capture: false }),
      response: Responses.aoe(),
    },
  ],
  timelineReplace: [
    {
      'locale': 'de',
      'replaceSync': {
        'Azeyma': 'Azeyma',
        'Azeyma\'s Heat': 'Azeymas Spiegelung',
        'Byregot': 'Byregot',
        'Byregot\'s Avatar': 'Byregots Abbild',
        'Ingenuity\'s Foothold': 'Schrein des Handwerks',
        'Lightning Orb': 'Blitzkugel',
        'Lion of Aglaia': 'Aglaia-L??we',
        'Lioness of Aglaia': 'Aglaia-L??win',
        'Nald': 'Nald',
        'Nald\'thal': 'Nald\'Thal',
        'Prodigal Sun': 'Schemensonne',
        'Rhalgr': 'Rhalgr',
        'Rhalgr\'s Emissary': 'Rhalgrs Abgesandt(?:e|er|es|en)',
        'Soul Vessel': 'Seelengef????',
        'Sunstorm': 'Azeymas Aura',
        'Thal': 'Thal',
        'The Circle Of Inquiry': 'Schrein des Urteils',
        'The Endless City': 'Stadt der Herrlichkeit',
        'The Monument To Destruction': 'Schrein des Kometen',
        'The Path': 'Pfad der F??hrung',
        'The Twin Halls': 'Schrein der Zwei',
      },
      'replaceText': {
        '--hammer--': '--Hammer--',
        '\(fake\)': 'falsch',
        '\(proximity\)': 'Distanz',
        '\(summon\)': 'Beschw??rung',
        'Advent of the Eighth': 'Lehre des Kometen',
        'As Above, So Below': 'Flamme von Leben und Tod',
        'Balance': 'Seelenabrechnung',
        'Bolts from the Blue': 'Himmlischer Blitz',
        'Boltloop': 'Rundblitz',
        'Bronze Lightning': 'Donner',
        'Bronze Work': 'Donnerstab',
        'Broken World': 'Komet der Zerst??rung',
        'Builder\'s Build': 'Byregots Erbauung',
        'Byregot\'s Spire': 'Byregots Turm',
        'Byregot\'s Strike': 'Byregots Schlag',
        'Byregot\'s Ward': 'Byregots Schutz',
        'Cloud to Ground': 'Sturmkonzentration',
        'Dancing Flame': 'Tanzende Flamme',
        'Deepest Pit': 'Feierlicher Todeshauch',
        'Destructive Bolt': 'Zerst??rerischer Blitzschlag',
        'Destructive Charge': 'Zerst??rerschock',
        'Destructive Static': 'Zerst??rerhieb',
        'Destructive Strike': 'Zerst??rerhieb',
        'Double Immolation': 'Lehre der Zwillingsflamme',
        'Equal Weight': 'Seelenplus',
        'Fan Flames': 'F??cherflammen',
        'Far Above, Deep Below': 'Leben und Tod: Entfesselung',
        'Far-flung Fire': 'Befreite Lebensflamme',
        'Fired Up I(?!I)': '1. Substanz des Feuers',
        'Fired Up II(?!I)': '2. Substanz des Feuers',
        'Fired Up III': '3. Substanz des Feuers',
        'Fleeting Spark': 'Feurige Falle',
        'Fortune\'s Flux': 'Quelle des Feuers',
        'Golden Tenet': 'Nald-Feuer',
        'Hand of the Destroyer': 'Vernichtungsschlag des Zerst??rers',
        'Haute Air': 'Hei??e Luft',
        'Hearth Above, Flight Below': 'Leben und Tod: Lohenbogen',
        'Heat Above, Flames Below': 'Leben und Tod: Ringfeuer',
        'Heavens\' Trial': 'W??rde des Flammenhimmels',
        'Hell of Fire': 'Infernowelle',
        'Hell of Lightning': 'Donnerkugel',
        'Hells\' Trial': 'W??rde der Flammenh??lle',
        'Illuminating Glimpse': 'Flimmern der Flammen',
        'Levinforge': 'Gewitterschein',
        'Lightning Bolt': 'Blitzschlag',
        'Lightning Reign': 'G??ttliches Donnertosen',
        'Lightning Storm': 'Blitzsturm',
        'Magmatic Spell': 'Erschaffener Fels',
        'Noble Dawn': 'Urteil der Sonne',
        'Once Above, Ever Below': 'Leben und Tod: Raubfeuer',
        'Ordeal of Thunder': 'Pr??fender Donner',
        'Peal of the Hammer': 'Byregots Hammer',
        'Radiant Finish': 'Letzter F??chertanz',
        'Radiant Rhythm': 'F??chertanz',
        'Rejuvenating Spark': 'Feuer des Lebens',
        'Reproduce': 'Teilung des Selbsts',
        'Rhalgr\'s Beacon': 'Fallender Stern',
        'Roaring Blaze': 'Lehre der Tosenden Flamme',
        'Seventh Passage': 'Kreis des Flammenhimmels',
        'Shock': 'Entladung',
        'Slash and Burn': 'Feuerkralle',
        'Smelting': 'Ersch??tterungswelle',
        'Solar Fans': 'F??cherschneide',
        'Solar Flair': 'Sonnenstaub',
        'Solar Fold': 'Sonnenschlag',
        'Solar Wings': 'Sonnenfl??gel',
        'Soul\'s Measure': 'Urteil der Waage',
        'Spinning Slash': 'Wirbeltatze',
        'Striking Meteor': 'Sternschnuppe',
        'Stygian Tenet': 'Thal-Feuer',
        'Sublime Sunset': 'G??ttliches Abendrot',
        'Sun\'s Shine': 'Trugbild der Hitze',
        'Sunbeam': 'Sonnenstrahl',
        '(?<! )Sunset': 'Abendrot',
        'The Builder\'s Forge': 'Byregots Sch??pfung',
        'Tipped Scales': 'G??ttliche Rechenschaft',
        'Trial by Fire': 'Lehre des Brausenden Feuers',
        'Twingaze': 'Hitzewallung',
        'Warden\'s Prominence': 'Wunder der Aufseherin',
        'Warden\'s Warmth': 'G??tterfeuer',
        'Wayward Soul': 'Leid der Toten',
        'Wildfire Ward': 'Lauffeuer',
      },
    },
    {
      'locale': 'fr',
      'missingTranslations': true,
      'replaceSync': {
        'Azeyma': 'Azeyma',
        'Azeyma\'s Heat': 'mirage d\'Azeyma',
        'Byregot': 'Byregot',
        'Byregot\'s Avatar': 'double de Byregot',
        'Ingenuity\'s Foothold': 'Gloire de l\'ing??niosit??',
        'Lightning Orb': 'orbe de foudre',
        'Lion of Aglaia': 'lion d\'Agla??',
        'Lioness of Aglaia': 'lionne d\'Agla??',
        'Nald': 'Nald',
        'Nald\'thal': 'Nald\'Thal',
        'Prodigal Sun': 'soleil illusoire',
        'Rhalgr': 'Rhalgr',
        'Rhalgr\'s Emissary': '??missaire de Rhalgr',
        'Soul Vessel': 'r??ceptacle d\'??me',
        'Sunstorm': 'aura solaire',
        'Thal': 'Thal',
        'The Circle Of Inquiry': 'Cercle de la justice',
        'The Endless City': 'Cit?? des splendeurs',
        'The Monument To Destruction': 'Monument ?? la destruction',
        'The Path': 'Corridor c??leste',
        'The Twin Halls': 'Palais jumeau',
      },
      'replaceText': {
        'Advent of the Eighth': 'Anneaux astraux',
        'As Above, So Below': 'Flamme de vie, flamme de mort',
        '(?<! )Balance': 'Jugement pananimique',
        'Bolts from the Blue': '??clairs c??lestes',
        'Boltloop': 'Anneaux ??lectriques',
        'Bronze Lightning': 'Saillie survolt??e',
        'Bronze Work': 'B??ton grondant',
        'Broken World': 'Com??te de Rhalgr',
        'Builder\'s Build': 'Besogne de Byregot',
        'Byregot\'s Spire': 'Tour de Byregot',
        'Byregot\'s Strike': 'Foreuse de Byregot',
        'Byregot\'s Ward': 'Aire de l\'Artisan',
        'Cloud to Ground': 'Attaque fulminante',
        'Dancing Flame': 'Flamme dansante',
        'Deepest Pit': 'Explosion ??tendue de mort',
        'Destructive Bolt': 'Foudre destructrice',
        'Destructive Charge': 'Charges destructrices',
        'Destructive Static': 'Taillade destructrice',
        'Destructive Strike': 'Taillade destructrice',
        'Double Immolation': 'Immolation double',
        'Equal Weight': 'Suppl??ment d\'??me',
        'Fan Flames': 'Flammes d\'??ventail',
        'Far Above, Deep Below': 'Vie ou mort : d??cha??nement',
        'Far-flung Fire': 'D??flagration distante de vie',
        'Fired Up I(?!I)': 'Accumulation d\'avoirs I',
        'Fired Up II(?!I)': 'Accumulation d\'avoirs II',
        'Fired Up III': 'Accumulation d\'avoirs III',
        'Fleeting Spark': 'Retourn?? rayonnant',
        'Fortune\'s Flux': 'Flux de la fortune',
        'Golden Tenet': 'Dogme dor??',
        'Hand of the Destroyer': 'Main du Destructeur',
        'Haute Air': '??ventement ??minent',
        'Hearth Above, Flight Below': 'Vie ou mort : arc ardent',
        'Heat Above, Flames Below': 'Vie ou mort : cercle de feu',
        'Heavens\' Trial': 'Jugement c??leste',
        'Hell of Fire': 'Enfer de feu',
        'Hell of Lightning': 'Enfer ??lectrique',
        'Hells\' Trial': 'Jugement infernal',
        'Illuminating Glimpse': 'Scintillement incandescent',
        'Levinforge': 'Fulguration funeste',
        'Lightning Bolt': '??clair de foudre',
        'Lightning Reign': 'R??gne foudroyant',
        'Lightning Storm': 'Pluie d\'??clairs',
        'Magmatic Spell': 'Fracas magmatique',
        'Noble Dawn': 'Aurore alti??re',
        'Once Above, Ever Below': 'Vie ou mort : calcination',
        'Ordeal of Thunder': '??preuve ??lectrique',
        'Peal of the Hammer': 'Marteau divin',
        'Radiant Finish': 'Final enflamm??',
        'Radiant Rhythm': 'Rythme enflamm??',
        'Rejuvenating Spark': '??tincelle de vie',
        'Reproduce': 'Reproduction',
        'Rhalgr\'s Beacon': 'Com??te d\'annihilation',
        'Roaring Blaze': 'Brasier rugissant',
        'Seventh Passage': 'Ciel de feu',
        'Shock': 'D??charge ??lectrostatique',
        'Slash and Burn': 'Griffes torrides',
        'Smelting': 'Secousse d??ferlante',
        'Solar Fans': '??ventails solaires',
        'Solar Flair': 'Poussi??re solaire',
        'Solar Fold': 'Repli solaire',
        'Solar Wings': 'Ailes solaires',
        'Soul\'s Measure': '??preuve de la balance',
        'Spinning Slash': 'Griffes tourbillonnantes',
        'Striking Meteor': 'M??t??ore minutieux',
        'Stygian Tenet': 'Dogme destructif',
        'Sublime Sunset': 'Cr??puscule c??r??moniel',
        'Sun\'s Shine': 'Mirages de chaleur',
        'Sunbeam': 'Rayon de soleil',
        '(?<! )Sunset': 'Cr??puscule',
        'The Builder\'s Forge': 'Grand ??uvre de l\'Artisan',
        'Tipped Scales': 'Verdict supr??me',
        'Trial by Fire': '??preuve du feu ??carlate',
        'Twingaze': '??illade odieuse',
        'Warden\'s Prominence': 'Grandeur de la Gardienne',
        'Warden\'s Warmth': '??treinte effervescente',
        'Wayward Soul': 'An??antissement animique',
        'Wildfire Ward': 'Enclave embras??e',
      },
    },
    {
      'locale': 'ja',
      'missingTranslations': true,
      'replaceSync': {
        'Azeyma(?!\')': '????????????',
        'Azeyma\'s Heat': '????????????????????????',
        'Byregot(?!\')': '????????????',
        'Byregot\'s Avatar': '?????????????????????',
        'Ingenuity\'s Foothold': '?????????',
        'Lightning Orb': '??????',
        'Lion of Aglaia': '??????????????????????????????',
        'Lioness of Aglaia': '?????????????????????????????????',
        'Nald(?!\')': '?????????',
        'Nald\'thal': '????????????',
        'Prodigal Sun': '?????????',
        'Rhalgr(?!\')': '???????????????',
        'Rhalgr\'s Emissary': '???????????????????????????????????????',
        'Soul Vessel': '?????????',
        'Sunstorm': '?????????',
        '(?<!\')Thal': '?????????',
        'The Circle Of Inquiry': '?????????',
        'The Endless City': '???????????????',
        'The Monument To Destruction': '?????????',
        'The Path': '???????????????',
        'The Twin Halls': '?????????',
      },
      'replaceText': {
        'Advent of the Eighth': '?????????',
        'As Above, So Below': '??????????????????',
        'Balance': '????????????',
        'Bolts from the Blue': '??????',
        'Boltloop': '??????',
        'Bronze Lightning': '??????',
        'Bronze Work': '????????????',
        'Broken World': '???????????????',
        'Builder\'s Build': '????????????????????????????????????',
        'Byregot\'s Spire': '??????????????????????????????',
        'Byregot\'s Strike': '?????????????????????????????????',
        'Byregot\'s Ward': '??????????????????????????????',
        'Cloud to Ground': '??????',
        'Dancing Flame': '??????',
        'Deepest Pit': '?????????',
        'Destructive Bolt': '?????????',
        'Destructive Charge': '?????????',
        'Destructive Static': '?????????',
        'Destructive Strike': '?????????',
        'Double Immolation': '?????????',
        'Equal Weight': '????????????',
        'Fan Flames': '????????????',
        'Far Above, Deep Below': '?????????????????????',
        'Far-flung Fire': '?????????',
        'Fired Up I(?!I)': '??????????????????',
        'Fired Up II(?!I)': '??????????????????',
        'Fired Up III': '??????????????????',
        'Fleeting Spark': '????????????',
        'Fortune\'s Flux': '????????????',
        'Golden Tenet': '???????????????',
        'Hand of the Destroyer': '???????????????',
        'Haute Air': '????????????',
        'Hearth Above, Flight Below': '?????????????????????',
        'Heat Above, Flames Below': '?????????????????????',
        'Heavens\' Trial': '???????????????',
        'Hell of Fire': '?????????',
        'Hell of Lightning': '?????????',
        'Hells\' Trial': '???????????????',
        'Illuminating Glimpse': '????????????',
        'Levinforge': '??????',
        'Lightning Bolt': '??????',
        'Lightning Reign': '????????????',
        'Lightning Storm': '??????',
        'Magmatic Spell': '?????????',
        'Noble Dawn': '???????????????',
        'Once Above, Ever Below': '?????????????????????',
        'Ordeal of Thunder': '??????????????????????????????',
        'Peal of the Hammer': '??????????????????????????????',
        'Radiant Finish': '?????????????????????',
        'Radiant Rhythm': '????????????',
        'Rejuvenating Spark': '?????????',
        'Reproduce': '????????????',
        'Rhalgr\'s Beacon': '???????????????',
        'Roaring Blaze': '?????????',
        'Seventh Passage': '?????????',
        'Shock': '??????',
        'Slash and Burn': '????????????',
        'Smelting': '?????????',
        'Solar Fans': '????????????',
        'Solar Flair': '????????????',
        'Solar Fold': '?????????',
        'Solar Wings': '???????????????',
        'Soul\'s Measure': '???????????????',
        'Spinning Slash': '????????????',
        'Striking Meteor': '?????????',
        'Stygian Tenet': '???????????????',
        'Sublime Sunset': '???????????????',
        'Sun\'s Shine': '??????',
        'Sunbeam': '?????????',
        '(?<! )Sunset': '??????',
        'The Builder\'s Forge': '???????????????????????????????????????',
        'Tipped Scales': '????????????',
        'Trial by Fire': '?????????',
        'Twingaze': '??????',
        'Warden\'s Prominence': '????????????',
        'Warden\'s Warmth': '??????',
        'Wayward Soul': '?????????',
        'Wildfire Ward': '????????????',
      },
    },
    {
      'locale': 'cn',
      'replaceSync': {
        'Azeyma(?!\')': '?????????',
        'Azeyma\'s Heat': '??????????????????',
        'Byregot(?!\')': '?????????',
        'Byregot\'s Avatar': '??????????????????',
        'Ingenuity\'s Foothold': '?????????',
        'Lightning Orb': '?????????',
        'Lion of Aglaia': '??????????????????',
        'Lioness of Aglaia': '??????????????????',
        'Nald(?!\')': '?????????',
        'Nald\'thal': '????????????',
        'Prodigal Sun': '??????',
        'Rhalgr(?!\')': '?????????',
        'Rhalgr\'s Emissary': '???????????????',
        'Soul Vessel': '??????',
        'Sunstorm': '?????????',
        '(?<!\')Thal': '?????????',
        'The Circle Of Inquiry': '?????????',
        'The Endless City': '????????????',
        'The Monument To Destruction': '?????????',
        'The Path': '????????????',
        'The Twin Halls': '?????????',
      },
      'replaceText': {
        '--hammer--': '--??????--',
        '\(fake\)': '???',
        '\(proximity\)': '???',
        '\(summon\)': '??????',
        'Advent of the Eighth': '?????????',
        'As Above, So Below': '??????????????????',
        'Balance': '???????????????',
        'Bolts from the Blue': '??????',
        'Boltloop': '??????',
        'Bronze Lightning': '??????',
        'Bronze Work': '????????????',
        'Broken World': '???????????????',
        'Builder\'s Build': '????????????',
        'Byregot\'s Spire': '???????????????',
        'Byregot\'s Strike': '????????????',
        'Byregot\'s Ward': '????????????',
        'Cloud to Ground': '??????',
        'Dancing Flame': '??????',
        'Deepest Pit': '????????????',
        'Destructive Bolt': '????????????',
        'Destructive Charge': '????????????',
        'Destructive Static': '????????????',
        'Destructive Strike': '????????????',
        'Double Immolation': '?????????',
        'Equal Weight': '???????????????',
        'Fan Flames': '????????????',
        'Far Above, Deep Below': '??????????????????',
        'Far-flung Fire': '????????????',
        'Fired Up I(?!I)': '?????????????????',
        'Fired Up II(?!I)': '?????????????????',
        'Fired Up III': '??????????????????',
        'Fleeting Spark': '????????????',
        'Fortune\'s Flux': '????????????',
        'Golden Tenet': '????????????',
        'Hand of the Destroyer': '???????????????',
        'Haute Air': '????????????',
        'Hearth Above, Flight Below': '??????????????????',
        'Heat Above, Flames Below': '??????????????????',
        'Heavens\' Trial': '????????????',
        'Hell of Fire': '?????????',
        'Hell of Lightning': '?????????',
        'Hells\' Trial': '????????????',
        'Illuminating Glimpse': '????????????',
        'Levinforge': '??????',
        'Lightning Bolt': '??????',
        'Lightning Reign': '????????????',
        'Lightning Storm': '??????',
        'Magmatic Spell': '?????????',
        'Noble Dawn': '???????????????',
        'Once Above, Ever Below': '??????????????????',
        'Ordeal of Thunder': '????????????',
        'Peal of the Hammer': '???????????????',
        'Radiant Finish': '????????????????????',
        'Radiant Rhythm': '????????????',
        'Rejuvenating Spark': '????????????',
        'Reproduce': '???????????????',
        'Rhalgr\'s Beacon': '???????????????',
        'Roaring Blaze': '?????????',
        'Seventh Passage': '?????????',
        'Shock': '??????',
        'Slash and Burn': '????????????',
        'Smelting': '?????????',
        'Solar Fans': '????????????',
        'Solar Flair': '????????????',
        'Solar Fold': '?????????',
        'Solar Wings': '???????????????',
        'Soul\'s Measure': '???????????????',
        'Spinning Slash': '????????????',
        'Striking Meteor': '?????????',
        'Stygian Tenet': '????????????',
        'Sublime Sunset': '??????????????',
        'Sun\'s Shine': '??????',
        'Sunbeam': '?????????',
        '(?<! )Sunset': '??????',
        'The Builder\'s Forge': '????????????',
        'Tipped Scales': '????????????',
        'Trial by Fire': '?????????',
        'Twingaze': '??????',
        'Warden\'s Prominence': '????????????',
        'Warden\'s Warmth': '??????',
        'Wayward Soul': '?????????',
        'Wildfire Ward': '????????????',
      },
    },
  ],
};

export default triggerSet;
