package com.lx.server.kafka.bean;

import lombok.Data;

@Data
public class KafkaMessage{
    private Integer type;
    private String userId;
    private String title;
    private Object data;

    public KafkaMessage(Integer type,String userId, String title,Object data){
        this.type = type;
        this.userId = userId;
        this.title = title;
        this.data = data;
    }
}
