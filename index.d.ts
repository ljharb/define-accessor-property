type Getter<T> = () => T;
type Setter<T> = (value: T) => void;

declare function defineAccessorProperty(
	obj: Record<PropertyKey, unknown>,
	key: keyof typeof obj,
	options: {
        loose?: boolean;
        nonConfigurable?: boolean | null;
        nonEnumerable?: boolean | null;
    } & (
        | {
            get: Getter<typeof obj[typeof key]>,
            set?: Setter<typeof obj[typeof key]>,
        }
        | {
            get?: Getter<typeof obj[typeof key]>,
            set: Setter<typeof obj[typeof key]>,
        }
    )
): void;

export = defineAccessorProperty;
