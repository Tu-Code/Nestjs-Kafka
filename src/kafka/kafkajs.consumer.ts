import { Logger } from "@nestjs/common";
import { Consumer, ConsumerConfig, ConsumerSubscribeTopic, Kafka, KafkaMessage } from "kafkajs";
import { IConsumer } from "./consumer.interface";
import { sleep } from "./sleep";
import * as retry from 'async-retry';

export class KafkajsConsumer implements IConsumer{
    private readonly kafka: Kafka;
    private readonly consumer: Consumer;
    private readonly logger: Logger;

    constructor(
        private readonly topic: ConsumerSubscribeTopic,
        config: ConsumerConfig,
        broker: string
    ) {
        this.kafka = new Kafka({ brokers: [broker] });
        this.consumer = this.kafka.consumer(config);
        this.logger = new Logger(`${topic.topic}-${config.groupId}`);
    }
    
    async connect () {
        try{
            await this.consumer.connect();
        } catch (err) {
            this.logger.error('Failed to connect to Kafka', err);
            await sleep(5000);
            await this.connect();
        }
    }

    async disconnect(){
        await this.consumer.disconnect();
    }    

    async consume(onMessage: (message: KafkaMessage) => Promise<void>){
        await this.consumer.subscribe(this.topic)
        await this.consumer.run({
            eachMessage: async({ message, partition }) => {
                this.logger.debug(`Processing message partition: ${partition}`);
                try {
                    await retry(async () => onMessage(message), {
                        retries: 3, 
                        onRetry: (error, attempt) => 
                            this.logger.error(
                                `Error consuming message, executing retry after ${attempt}/3`,
                        error
                        ),
                    });
                } catch (err) {
                    this.logger.error('Error consuming message. Adding to DLQ...', err);
                    await this.addMessageToDlq(message);
                }
            }
        })
    }

    private async addMessageToDlq(message: KafkaMessage){

    }
}