//global config goes here
/* Defines constants to be accesible at config and run time */
/* Defines values to be accesible at runtime */
angular.module("omniConfig", [])
  .constant("idleDuration", 30 * 60) // 30 minutes
  .constant("idleWarningDuration", 2 * 60) // 2 minutes
  .constant("reCaptchaKey", "----KEY----")
  .value("SATOSHI_UNIT", new Big(100000000)) //Backend data needs satoshi, use this conversion ratio
  .value("MIN_MINER_FEE", new Big(0.00025000))
  .value("MINER_SPEED", 'fast')  //Synamic Fee Calculation, valid options are 'normal','fast','faster'
  .value("OMNI_PROTOCOL_COST", new Big(0.00000546))
  .value("WHOLE_UNIT",new Big(0.00000001));
