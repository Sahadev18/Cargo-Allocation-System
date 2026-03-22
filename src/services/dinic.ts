export class Dinic {
  private n: number;
  private adj: Edge[][];
  private level: number[];
  private it: number[];

  constructor(n: number) {
    this.n = n;
    this.adj = Array.from({ length: n }, () => []);
    this.level = new Array(n).fill(-1);
    this.it = new Array(n).fill(0);
  }

  addEdge(fr: number, to: number, cap: number) {
    if (cap < 0) throw new Error('Negative capacity not allowed');
    const forward = new Edge(to, this.adj[to].length, cap);
    const backward = new Edge(fr, this.adj[fr].length, 0);
    this.adj[fr].push(forward);
    this.adj[to].push(backward);
  }

  private bfs(s: number, t: number): boolean {
    this.level.fill(-1);
    const queue: number[] = [s];
    this.level[s] = 0;

    while (queue.length > 0) {
      const v = queue.shift() as number;
      for (const e of this.adj[v]) {
        if (e.cap > 0 && this.level[e.to] < 0) {
          this.level[e.to] = this.level[v] + 1;
          queue.push(e.to);
        }
      }
    }

    return this.level[t] >= 0;
  }

  private dfs(v: number, t: number, f: number): number {
    if (v === t) return f;
    for (let i = this.it[v]; i < this.adj[v].length; i += 1) {
      this.it[v] = i;
      const e = this.adj[v][i];
      if (e.cap > 0 && this.level[v] < this.level[e.to]) {
        const ret = this.dfs(e.to, t, Math.min(f, e.cap));
        if (ret > 0) {
          e.cap -= ret;
          this.adj[e.to][e.rev].cap += ret;
          return ret;
        }
      }
    }
    return 0;
  }

  maxFlow(s: number, t: number): number {
    let flow = 0;
    while (this.bfs(s, t)) {
      this.it.fill(0);
      let f;
      do {
        f = this.dfs(s, t, Number.MAX_SAFE_INTEGER);
        flow += f;
      } while (f > 0);
    }
    return flow;
  }
}

class Edge {
  to: number;
  rev: number;
  cap: number;

  constructor(to: number, rev: number, cap: number) {
    this.to = to;
    this.rev = rev;
    this.cap = cap;
  }
}
