import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const repoRoot = new URL('../../../../../../', import.meta.url)

function readRepoFile(path: string) {
  return readFileSync(new URL(path, repoRoot), 'utf8')
}

describe('local auth integration environment', () => {
  it('pins mobile and backend local env examples to the same Firebase project', () => {
    const mobileEnvExample = readRepoFile('apps/mobile/.env.example')
    const apiEnvExample = readRepoFile('apps/api/.env.example')

    expect(mobileEnvExample).toContain(
      'EXPO_PUBLIC_FIREBASE_PROJECT_ID=carbon-tracker-c1925'
    )
    expect(apiEnvExample).toContain('GOOGLE_CLOUD_PROJECT=carbon-tracker-c1925')
  })

  it('documents the local backend auth smoke test target', () => {
    const firebaseSetupGuide = readRepoFile('docs/firebase-setup.md')

    expect(firebaseSetupGuide).toContain('http://10.0.2.2:3000')
  })

  it('documents backend Admin credentials and Firestore access for the pinned project', () => {
    const firebaseSetupGuide = readRepoFile('docs/firebase-setup.md')

    expect(firebaseSetupGuide).toContain(
      'the backend must use Admin credentials for the same Firebase project, `carbon-tracker-c1925`, and use Firestore in that project as its local data target'
    )
    expect(firebaseSetupGuide).toContain(
      'make sure the service account file also belongs to `carbon-tracker-c1925`'
    )
  })
})
