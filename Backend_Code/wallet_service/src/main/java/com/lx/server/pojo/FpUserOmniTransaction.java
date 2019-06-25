package com.lx.server.pojo;

import java.math.BigDecimal;
import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【快速支付的用户的交易记录】持久化对象 数据库表：t_fp_user_omni_transaction
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:57
 *
 */
public class FpUserOmniTransaction extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // omni的资产id btc为0 usdt为31 lx为361
    private Long propertyId;
    // 源头地址
    private String fromAddress;
    // 目标地址
    private String toAddress;
    // 交易类型：0：钱包内部充值，10：提现
    private Integer txType;
    // 交易数量
    private BigDecimal amount;
    // 公链的交易id
    private String txid;
    // 矿工确认数量
    private Integer confirmations;
    // 是否有效
    private Boolean isEnable;
    // 创建时间
    private Date createTime;
    // 创建人
    private Integer createBy;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public Long getPropertyId() {
        return propertyId;
    }

    /** 设置 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    /** 获取 源头地址 属性 */
    public String getFromAddress() {
        return fromAddress;
    }

    /** 设置 源头地址 属性 */
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

    /** 获取 交易类型：0：钱包内部充值，10：提现 属性 */
    public Integer getTxType() {
        return txType;
    }

    /** 设置 交易类型：0：钱包内部充值，10：提现 属性 */
    public void setTxType(Integer txType) {
        this.txType = txType;
    }

    /** 获取 交易数量 属性 */
    public BigDecimal getAmount() {
        return amount;
    }

    /** 设置 交易数量 属性 */
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    /** 获取 公链的交易id 属性 */
    public String getTxid() {
        return txid;
    }

    /** 设置 公链的交易id 属性 */
    public void setTxid(String txid) {
        this.txid = txid;
    }

    /** 获取 矿工确认数量 属性 */
    public Integer getConfirmations() {
        return confirmations;
    }

    /** 设置 矿工确认数量 属性 */
    public void setConfirmations(Integer confirmations) {
        this.confirmations = confirmations;
    }

    /** 获取 是否有效 属性 */
    public Boolean getIsEnable() {
        return isEnable;
    }

    /** 设置 是否有效 属性 */
    public void setIsEnable(Boolean isEnable) {
        this.isEnable = isEnable;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 创建人 属性 */
    public Integer getCreateBy() {
        return createBy;
    }

    /** 设置 创建人 属性 */
    public void setCreateBy(Integer createBy) {
        this.createBy = createBy;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("FpUserOmniTransaction");
        sb.append("{id=").append(id);
        sb.append(", propertyId=").append(propertyId);
        sb.append(", fromAddress=").append(fromAddress);
        sb.append(", toAddress=").append(toAddress);
        sb.append(", txType=").append(txType);
        sb.append(", amount=").append(amount);
        sb.append(", txid=").append(txid);
        sb.append(", confirmations=").append(confirmations);
        sb.append(", isEnable=").append(isEnable);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpUserOmniTransaction) {
            FpUserOmniTransaction fpUserOmniTransaction = (FpUserOmniTransaction) obj;
            if (this.getId().equals(fpUserOmniTransaction.getId())) {
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
