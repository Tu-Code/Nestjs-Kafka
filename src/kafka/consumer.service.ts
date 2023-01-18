import { Injectable, OnApplicationShutdown } from '@nestjs/common';
 import {
   Consumer,
   ConsumerRunConfig,
   ConsumerSubscribeTopic,
   Kafka,
 } from 'kafkajs';
import { IConsumer } from './consumer.interface';
import { KafkajsConsumer } from './kafkajs.consumer';
import { KafkajsConsumerOptions } from './kafkajs-consumer-options.interface';

 @Injectable()
 export class ConsumerService implements OnApplicationShutdown {
   private readonly consumers: IConsumer[] = [];

   async consume({ topic, config, onMessage}: KafkajsConsumerOptions){
    const consumer = new KafkajsConsumer(
      topic,
      config,
      this.configService.get('KAFKA_BROKER'),
    );
     await consumer.connect();
     await consumer.consume(onMessage);
     this.consumers.push(consumer)
   }

   async onApplicationShutdown() {
     for (const consumer of this.consumers) {
       await consumer.disconnect();
     }
   }
 }