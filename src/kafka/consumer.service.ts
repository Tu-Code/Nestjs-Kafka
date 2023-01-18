import { Injectable, OnApplicationShutdown } from '@nestjs/common';
 import {
   Consumer,
   ConsumerRunConfig,
   ConsumerSubscribeTopic,
   Kafka,
 } from 'kafkajs';
import { IConsumer } from './consumer.interface';

 @Injectable()
 export class ConsumerService implements OnApplicationShutdown {
   private readonly consumers: IConsumer[] = [];

   async consume() {
     
   }

   async onApplicationShutdown() {
     for (const consumer of this.consumers) {
       await consumer.disconnect();
     }
   }
 }