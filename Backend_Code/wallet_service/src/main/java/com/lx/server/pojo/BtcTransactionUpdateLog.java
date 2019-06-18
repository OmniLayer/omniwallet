package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【btc交易记录更新日志】持久化对象 数据库表：t_btc_transaction_update_log
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-10 10:08:45
 *
 */
public class BtcTransactionUpdateLog extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // 
    private Integer id;
    // 
    private Integer fromIndex;
    // 
    private Integer toIndex;
    // 创建时间
    private Date createTime;

    /** 获取  属性 */
    public Integer getId() {
        return id;
    }

    /** 设置  属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取  属性 */
    public Integer getFromIndex() {
        return fromIndex;
    }

    /** 设置  属性 */
    public void setFromIndex(Integer fromIndex) {
        this.fromIndex = fromIndex;
    }

    /** 获取  属性 */
    public Integer getToIndex() {
        return toIndex;
    }

    /** 设置  属性 */
    public void setToIndex(Integer toIndex) {
        this.toIndex = toIndex;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("BtcTransactionUpdateLog");
        sb.append("{id=").append(id);
        sb.append(", fromIndex=").append(fromIndex);
        sb.append(", toIndex=").append(toIndex);
        sb.append(", createTime=").append(createTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof BtcTransactionUpdateLog) {
            BtcTransactionUpdateLog btcTransactionUpdateLog = (BtcTransactionUpdateLog) obj;
            if (this.getId().equals(btcTransactionUpdateLog.getId())) {
                return true;
            }
        }
        return false;
    }

    public int hashCode() {
        String pkStr = "" + this.getId();
        return pkStr.hashCode();
    }

}
