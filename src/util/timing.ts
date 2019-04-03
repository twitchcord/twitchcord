
export class Cooldown {
  private BlockUntil = 0
  constructor(private limit: number) {}
  fire() {
    const now = Date.now()
    return now > this.BlockUntil && (this.BlockUntil = now + this.limit, true)
  }
  get ready() {
    return this.BlockUntil < Date.now()
  }
}