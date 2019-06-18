package com.lx.server.bean;



import java.util.List;

import com.lx.server.pojo.AbstractObject;


public class Page extends AbstractObject {
	public List<Object> data;
	/**
	 * 
	 * 分页查询开始记录位置.
	 * 
	 */
	private int begin;
	/**
	 * 
	 * 分页查看下结束位置.
	 * 
	 */
	private int end;
	/**
	 * 
	 * 每页显示记录数.
	 * 
	 */
	private int length = 10;
	/**
	 * 
	 * 查询结果总记录数.
	 * 
	 */
	private int totalRecords;
	/**
	 * 
	 * 当前页码.
	 * 
	 */
	private int pageNo;
	/**
	 * 
	 * 总共页数.
	 * 
	 */
	private int pageCount;
	public Page(){

	}

	public Page(int pageIndex, int pageSize, int rowCount, List<Object> data) {
		this.data = data;
		this.pageNo = pageIndex;
		this.begin=(this.pageNo - 1) * pageSize + 1;
		this.getEnd();
		this.pageCount = rowCount % pageSize == 0 ? rowCount / pageSize : rowCount / pageSize + 1;
		this.totalRecords = rowCount;
		this.length = rowCount;
	}



	public List<Object> getData() {
		return data;
	}

	public void setData(List<Object> data) {
		this.data = data;
	}

	public void setData(List<Object> data, int count) {
		this.data = data;
		this.setTotalRecords(count);
	}

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public int getBegin() {
		return begin;
	}

	public void setBegin(int begin) {
		this.begin = begin;
		if (this.length != 0) {
			this.pageNo = (int) Math.floor((this.begin * 1.0d) / this.length) + 1;
		}
	}

	public int getEnd() {
		int tempEnd = this.pageNo * length;
		this.end = tempEnd > totalRecords ? totalRecords : tempEnd;
		return end;
	}

	public void setEnd(int end) {
		this.end = end;
	}

	public int getLength() {
		return length;
	}

	public void setLength(int length) {
		this.length = length;
		if (this.begin != 0) {
			this.pageNo = (int) Math.floor((this.begin * 1.0d) / this.length) + 1;
		}
	}

	public int getTotalRecords() {
		return totalRecords;
	}

	public void setTotalRecords(int totalRecords) {
		this.totalRecords = totalRecords;
		this.end = end > totalRecords ? totalRecords : end;
		this.pageCount = (int) Math.floor((this.totalRecords * 1.0d) / this.length);
		if (this.totalRecords % this.length != 0) {
			this.pageCount++;
		}
	}

	public int getPageNo() {
		return pageNo;
	}

	public void setPageNo(int pageNo) {
		this.pageNo = pageNo;
		pageNo = pageNo > 0 ? pageNo : 1;
		this.begin = this.length * (pageNo - 1);
		this.end = this.length * pageNo;
	}

	public int getPageCount() {
		if (pageCount == 0) {
			return 1;
		}
		return pageCount;
	}

	public void setPageCount(int pageCount) {
		this.pageCount = pageCount;
	}

	@Override
	public String toString() {
		final StringBuilder builder = new StringBuilder("begin=").append(begin).append(", end=").append(end)
				.append(", length=").append(length).append(", totalRecords=").append(totalRecords).append(", pageNo=")
				.append(pageNo).append(", pageCount=").append(pageCount);
		return builder.toString();
	}
}
