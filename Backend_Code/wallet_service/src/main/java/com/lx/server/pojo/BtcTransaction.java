package com.lx.server.pojo;

import java.math.BigDecimal;
import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【btc的交易记录】持久化对象 数据库表：t_btc_transaction
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-10 10:12:11
 *
 */
public class BtcTransaction extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // txid
    private String id;
    // 来源地址
    private String fromAddress;
    // 目标地址
    private String toAddress;
    // 交易金额
    private BigDecimal amount;
    // 矿工费用
    private BigDecimal fee;
    // 区块高度
    private Integer blockHeight;
    // 上链时间
    private Date blockTime;
    // 区块高度
    private Integer blockIndex;
    // 区块hash
    private String blockHash;
    // 创建时间
    private Date createTime;

    /** 获取 txid 属性 */
    public String getId() {
        return id;
    }

    /** 设置 txid 属性 */
    public void setId(String id) {
        this.id = id;
    }

    /** 获取 来源地址 属性 */
    public String getFromAddress() {
        return fromAddress;
    }

    /** 设置 来源地址 属性 */
    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    /** 获取 目标地址 属性 */
    public String getToAddress() {
        return toAddress;
    }

    /** 设置 目标地址 属性 */
    public void setToAddress(String toAddress) {
        this.toAddress = toAddress;
    }

    /** 获取 交易金额 属性 */
    public BigDecimal getAmount() {
        return amount;
    }

    /** 设置 交易金额 属性 */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /** 获取 矿工费用 属性 */
    public BigDecimal getFee() {
        return fee;
    }

    /** 设置 矿工费用 属性 */
    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }

    /** 获取 区块高度 属性 */
    public Integer getBlockHeight() {
        return blockHeight;
    }

    /** 设置 区块高度 属性 */
    public void setBlockHeight(Integer blockHeight) {
        this.blockHeight = blockHeight;
    }

    /** 获取 上链时间 属性 */
    public Date getBlockTime() {
        return blockTime;
    }

    /** 设置 上链时间 属性 */
    public void setBlockTime(Date blockTime) {
        this.blockTime = blockTime;
    }

    /** 获取 区块高度 属性 */
    public Integer getBlockIndex() {
        return blockIndex;
    }

    /** 设置 区块高度 属性 */
    public void setBlockIndex(Integer blockIndex) {
        this.blockIndex = blockIndex;
    }

    /** 获取 区块hash 属性 */
    public String getBlockHash() {
        return blockHash;
    }

    /** 设置 区块hash 属性 */
    public void setBlockHash(String blockHash) {
        this.blockHash = blockHash;
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
        sb.append("BtcTransaction");
        sb.append("{id=").append(id);
        sb.append(", fromAddress=").append(fromAddress);
        sb.append(", toAddress=").append(toAddress);
        sb.append(", amount=").append(amount);
        sb.append(", fee=").append(fee);
        sb.append(", blockHeight=").append(blockHeight);
        sb.append(", blockTime=").append(blockTime);
        sb.append(", blockIndex=").append(blockIndex);
        sb.append(", blockHash=").append(blockHash);
        sb.append(", createTime=").append(createTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof BtcTransaction) {
            BtcTransaction btcTransaction = (BtcTransaction) obj;
            if (this.getId().equals(btcTransaction.getId())) {
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
