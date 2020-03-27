abstract class Counter {
    public static count = 0;

    public static inc (): number {
        return ++Counter.count;
    }
};

export default Counter;