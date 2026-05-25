export type DraftQueueFlusher<TDraft> = {
  flush: (ownerId: string) => Promise<void>
}

export function createDraftQueueFlusher<TDraft>({
  readDrafts,
  writeDrafts,
  submitDraft,
}: {
  readDrafts: (ownerId: string) => Promise<TDraft[]>
  writeDrafts: (ownerId: string, drafts: TDraft[]) => Promise<void>
  submitDraft: (draft: TDraft) => Promise<void>
}): DraftQueueFlusher<TDraft> {
  const inFlightFlushes = new Map<string, Promise<void>>()

  async function runFlush(ownerId: string) {
    const drafts = await readDrafts(ownerId)

    if (drafts.length === 0) {
      return
    }

    const remaining: TDraft[] = []

    for (const draft of drafts) {
      try {
        await submitDraft(draft)
      } catch {
        remaining.push(draft)
      }
    }

    await writeDrafts(ownerId, remaining)
  }

  return {
    async flush(ownerId: string) {
      const existingFlush = inFlightFlushes.get(ownerId)

      if (existingFlush) {
        return existingFlush
      }

      const nextFlush = runFlush(ownerId).finally(() => {
        inFlightFlushes.delete(ownerId)
      })

      inFlightFlushes.set(ownerId, nextFlush)

      return nextFlush
    },
  }
}
