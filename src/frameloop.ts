export const frameLoop = requestFrame();
type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>)=>void
}
const Defer = <T>() => {
    const p = {} as Deferred<T>
    p.promise = new Promise<T>((resolve) =>{
        p.resolve = resolve;
    });
    return p
}
export const requestFrame = () => {
    const tasks: Set<[p: Deferred<void>, task: ((now: number)=> void | false)]> = new Set();
    let frame : number | undefined = undefined;
    let running = false;
    const run = (now: number) => {
        frame = requestAnimationFrame(run);

        for (const taskItem of tasks) {
            const [promise, task]=taskItem
            const shouldRemove = task(now);
            if (shouldRemove === false) {
                tasks.delete(taskItem);
                promise.resolve()
            }
        }
    }
    return {
        add(task: ()=> void | false) {
            const promise = Defer<void>();
            const item = [promise, task] as [Deferred<void>, ()=>void | false];
            tasks.add(item)
            if (!running) {
                frame = requestAnimationFrame(run)
            }
            return {
                promise,
                abort() {
                    tasks.delete(item)
                }
            }
        }
    }
}