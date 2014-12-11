//global config goes here
/* Defines constants to be accesible at config and run time */
/* Defines values to be accesible at runtime */
angular.module("omniConfig", [])
  .constant("idleDuration", 10 * 60) // 10 minutes
  .constant("idleWarningDuration", 2 * 60) // 2 minutes
  .constant("reCaptchaKey", "----KEY----")
  .value("SATOSHI_UNIT", new Big(100000000)) //Backend data needs satoshi, use this conversion ratio
  .value("MIN_MINER_FEE", new Big(0.00010000))
  .value("MSC_PROTOCOL_COST",0.00025)
  .value("WHOLE_UNIT",new Big(0.00000001));