import { NPCId, NPCExpression } from './npcs';

export interface DialogueLine {
  npcId: NPCId;
  expression: NPCExpression;
  text: string;
}

export type DialogueScriptKey =
  | 'intro'
  | 'firstMapEntry'
  | 'reconnect0'
  | 'reconnect1'
  | 'reconnect2'
  | 'reconnect3'
  | 'mission1Open'
  | 'mission1Badge'
  | 'mission2Open'
  | 'mission2Badge'
  | 'mission3Open'
  | 'mission3Badge'
  | 'lockedMission';

function nameTag(name: string): string {
  return name;
}

// Generate dialogue scripts with student name interpolation
export function getDialogueScript(key: DialogueScriptKey, studentName: string = ''): DialogueLine[] {
  const n = nameTag(studentName);

  const scripts: Record<DialogueScriptKey, DialogueLine[]> = {
    // 1) Landing page intro
    intro: [
      { npcId: 'ohbaksa', expression: 'default', text: '허허, 어서 오게! 나는 오박사라고 한다네. 🔬' },
      { npcId: 'ohbaksa', expression: 'worried', text: '간식왕국에 큰 문제가 생겼어...' },
      { npcId: 'ohbaksa', expression: 'worried', text: '정크 바이러스가 왕국의 간식들을 건강하지 않게 만들고 있다네!' },
      { npcId: 'ohbaksa', expression: 'default', text: '자네의 힘이 필요해! 데이터의 힘으로 왕국을 구해주겠나?' },
      { npcId: 'ohbaksa', expression: 'default', text: '좋아! 그럼 먼저 이름을 알려주게!' },
    ],

    // 2) First map entry
    firstMapEntry: [
      { npcId: 'ohbaksa', expression: 'celebrate', text: `${n}! 반갑네~ 드디어 새로운 수호대원이 왔구먼!` },
      { npcId: 'ohbaksa', expression: 'default', text: '여기는 간식왕국 작전 지도라네.' },
      { npcId: 'ohbaksa', expression: 'default', text: '미션을 하나씩 클리어하면 배지를 받을 수 있어!' },
      { npcId: 'ohbaksa', expression: 'default', text: '나를 포함해서 3명의 박사가 자네를 도와줄 거야.' },
      { npcId: 'ohbaksa', expression: 'surprised', text: '먼저 MISSION 1부터 시작해보게! 탭해서 확인해봐!' },
    ],

    // 3) Reconnect — 0 badges
    reconnect0: [
      { npcId: 'ohbaksa', expression: 'default', text: `${n}, 다시 왔구먼! 아직 미션이 남아있어. 힘내게! 💪` },
    ],

    // 3) Reconnect — 1 badge
    reconnect1: [
      { npcId: 'ohbaksa', expression: 'default', text: `${n}! 챌린저 배지를 땄구먼! 다음 미션에는 다솜 박사가 기다리고 있다네!` },
    ],

    // 3) Reconnect — 2 badges
    reconnect2: [
      { npcId: 'ohbaksa', expression: 'default', text: `${n}, 거의 다 왔어! 마지막 미션에서 짱구 원장이 기다리고 있다네! ✨` },
    ],

    // 3) Reconnect — 3 badges
    reconnect3: [
      { npcId: 'ohbaksa', expression: 'celebrate', text: `${n}! 모든 미션 클리어! 자네는 진정한 데이터 마스터야! 🏆` },
    ],

    // 4) Mission 1 modal (ohbaksa)
    mission1Open: [
      { npcId: 'ohbaksa', expression: 'default', text: '이건 내가 담당하는 첫 번째 미션이라네!' },
      { npcId: 'ohbaksa', expression: 'surprised', text: '편의점 간식에 숨어있는 데이터를 찾아내는 거야!' },
      { npcId: 'ohbaksa', expression: 'default', text: '영양성분표... 그게 바로 데이터란다! 📊' },
      { npcId: 'ohbaksa', expression: 'default', text: '미션을 완료하면 선생님이 인증키를 알려줄 거야. 입력해보게!' },
    ],

    // 5) Mission 1 badge (ohbaksa)
    mission1Badge: [
      { npcId: 'ohbaksa', expression: 'celebrate', text: `허허! 축하하네, ${n}! 🎊` },
      { npcId: 'ohbaksa', expression: 'celebrate', text: '데이터 챌린저 배지를 획득했어!' },
      { npcId: 'ohbaksa', expression: 'default', text: '데이터를 찾아내는 눈을 가지게 됐구먼!' },
      { npcId: 'ohbaksa', expression: 'default', text: '다음 미션에서는 다솜 박사가 자네를 기다리고 있을 거야. 행운을 빌겠네!' },
    ],

    // 6) Mission 2 modal (dasom)
    mission2Open: [
      { npcId: 'dasom', expression: 'surprised', text: '안녕! 나는 다솜 박사야! 드디어 만났다! 🎨' },
      { npcId: 'dasom', expression: 'default', text: `오박사님한테 얘기 많이 들었어! ${n}, 기대하고 있었다고!` },
      { npcId: 'dasom', expression: 'default', text: '이번에는 데이터를 분석해서 건강한 간식을 직접 만들어보는 거야!' },
      { npcId: 'dasom', expression: 'surprised', text: '데이터로 간식을 리모델링하다니... 완전 재밌을 거야!' },
      { npcId: 'dasom', expression: 'default', text: '미션을 완료하면 인증키를 입력해줘!' },
    ],

    // 7) Mission 2 badge (dasom)
    mission2Badge: [
      { npcId: 'dasom', expression: 'celebrate', text: `와! 대박! ${n}, 진짜 잘했어! 🎊` },
      { npcId: 'dasom', expression: 'celebrate', text: '데이터 디렉터 배지 획득!' },
      { npcId: 'dasom', expression: 'default', text: '이제 데이터로 뭐든 만들 수 있는 크리에이터야!' },
      { npcId: 'dasom', expression: 'default', text: '마지막 미션은... 짱구 원장님이 기다리고 있어. 파이팅! 💪' },
    ],

    // 8) Mission 3 modal (jjanggu)
    mission3Open: [
      { npcId: 'jjanggu', expression: 'default', text: '좋아! 드디어 왔구나! 나는 짱구 원장이다! 🏋️' },
      { npcId: 'jjanggu', expression: 'default', text: '여기까지 온 것만으로도 대단해!' },
      { npcId: 'jjanggu', expression: 'surprised', text: '마지막 미션은 코딩으로 건강 간식 도우미를 직접 만드는 거야!' },
      { npcId: 'jjanggu', expression: 'surprised', text: '데이터와 코딩의 힘을 합치면... 뭐든 할 수 있다!!' },
      { npcId: 'jjanggu', expression: 'default', text: '마지막 인증키를 입력하면 진정한 데이터 마스터가 되는 거야! 🔥' },
    ],

    // 9) Mission 3 badge (jjanggu)
    mission3Badge: [
      { npcId: 'jjanggu', expression: 'celebrate', text: `으하하!! ${n}!! 해냈구나!! 🎊🎊🎊` },
      { npcId: 'jjanggu', expression: 'celebrate', text: '데이터 마스터 배지 획득!!' },
      { npcId: 'jjanggu', expression: 'celebrate', text: '넌 간식왕국의 진정한 영웅이야!!' },
      { npcId: 'jjanggu', expression: 'celebrate', text: '오박사, 다솜 박사, 나... 모두 자랑스럽다!! 🏆' },
    ],

    // 10) Locked mission click
    lockedMission: [
      { npcId: 'ohbaksa', expression: 'default', text: '아직 이 미션은 잠겨있다네! 🔒' },
      { npcId: 'ohbaksa', expression: 'default', text: '앞의 미션부터 차례대로 클리어해야 해!' },
    ],
  };

  return scripts[key] || [];
}
