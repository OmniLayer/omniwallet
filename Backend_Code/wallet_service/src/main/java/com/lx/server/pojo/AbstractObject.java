package com.lx.server.pojo;


import java.io.Serializable;
import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonIgnore;


public class AbstractObject implements Serializable, Cloneable {
    public static final long serialVersionUID = 1L;

    

    @JsonIgnore
    private String keyword;

    @JsonIgnore
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date beginTime;

    @JsonIgnore
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date endTime;


    public String getKeyword() {
		return keyword;
	}

	public void setKeyword(String keyword) {
		this.keyword = keyword;
	}

	public Date getBeginTime() {
		return beginTime;
	}

	public void setBeginTime(Date beginTime) {
		this.beginTime = beginTime;
	}

	public Date getEndTime() {
		return endTime;
	}

	public void setEndTime(Date endTime) {
		this.endTime = endTime;
	}

	@Override
	public String toString() {
        return "";
    }

    @Override
	public Object clone() {
        Object obj = null;
        try {
            obj = super.clone();
        } catch (CloneNotSupportedException e) {
            e.printStackTrace();
        }
        return obj;
    }
}
