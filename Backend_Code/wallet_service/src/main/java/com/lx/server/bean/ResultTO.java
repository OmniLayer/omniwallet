package com.lx.server.bean;

import java.io.Serializable;
import java.util.HashMap;

public class ResultTO implements Serializable, Cloneable {
	private static final long serialVersionUID = 1L;

	/** 返回状态--成功 */
	public static final int STATUS_SUCCESS = 1;
	/** 返回状态--失败 */
	public static final int STATUS_FAILURE = 0;


	private int status;
	// 附加消息
	private String msg;
	// 数据体
	private Object data;

	private ResultTO() {
		
	}

	private ResultTO(int status, String msg, Object data) {
		this.status = status;
		this.msg = msg;
		this.data = data;
	}

	public static ResultTO newFailResult(String msg) {
		return new ResultTO(ResultTO.STATUS_FAILURE, msg, new HashMap<>());
	}
	public static ResultTO newSuccessResult(String msg) {
		return new ResultTO(ResultTO.STATUS_SUCCESS, msg, new HashMap<>());
	}
	public static ResultTO newSuccessResult(Object data) {
		return ResultTO.newSuccessResult("success", data);
	}

	public static ResultTO newFailResult(Object data) {
		return ResultTO.newFailResult("failure", data);
	}

	public static ResultTO newFailResult(String msg, Object data) {
		return new ResultTO(ResultTO.STATUS_FAILURE, msg, data);
	}

	public static ResultTO newSuccessResult(String msg, Object data) {
		return ResultTO.newResult(ResultTO.STATUS_SUCCESS, msg, data);
	}
	public static ResultTO newResult(int status,String msg, Object data) {
		return new ResultTO(status, msg, data);
	}
	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

}
