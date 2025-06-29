# git-intent

[English](https://github.com/offlegacy/git-intent/blob/main/README.md) | 한국어

**git-intent**는 [의도적 커밋(intentional commits)](https://intentionalcommits.org/)을 생성하기 위한 Git 워크플로우 도구입니다.

## git-intent를 사용하는 이유

많은 개발자들은 코드를 먼저 작성하고 커밋 메시지는 나중에 작성해요.  
이런 방식은 크고 모호하며 초점이 흐려진 커밋으로 이어질 수 있어요.  
**git-intent**는 테스트 주도 개발(TDD) 방식에서 영감을 받아, 코딩을 시작하기 전에 개발 의도를 명확히 정의하도록 도와줘요.  
이로써 커밋 과정이 개발 흐름의 자연스러운 일부가 될 수 있어요.

사전에 의도를 정리하면 다음과 같은 장점이 있어요
- 깔끔하고 읽기 쉬운 커밋 히스토리를 만들 수 있어요
- 개발 목적을 명확하게 전달할 수 있어요
- 작업 범위 확장을 방지하고 원자적인 커밋을 유지할 수 있어요
- 협업과 유지보수 효율이 높아져요

## 요구 사항

- Git (>= 2.0)
- Node.js (>= 22)

## 사용법 (테스트용)

```bash
# 의도 추가
pnpm start add <intention>

# 목록 보기
pnpm start list
```

## 기여하기

여러분의 기여를 언제나 환영합니다. 자세한 가이드는 다음을 참조하세요.

[CONTRIBUTING.md](./CONTRIBUTING.md)

## 라이선스

MIT [OffLegacy](https://www.offlegacy.org/) — [LICENSE](https://github.com/offlegacy/git-intent/blob/main/LICENSE)
