export interface IConsumer{
    connect: () => Promise<void>;
    disconect: () => Promise<void>;
    consume: (onMessage: (message: any) => Promise<void>) => Promise<void>;
}