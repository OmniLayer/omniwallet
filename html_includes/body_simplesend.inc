            <div class="container page-container">
               <div class="row">
                  <div class="no-fixed col-sm-9 col-sm-push-3 col-md-10 col-md-push-2">
                     <div class="row">
                        <div class="col-md-12">
                           <table class="table table-striped table-hover table-condensed">
                              <tr>
                                 <td style="width:108px;"><strong>Transaction<strong></td>
                                 <td><span class="pull-right">{{transactionInformation.tx_hash}}</span></td>
                              </tr>
                           </table>
                        </div>
                     </div>
                     <div class="row">
                        <div class="transactionContainer">
                           <div class="col-md-6">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Basic Information</caption>
                                 <tbody>
                                    <tr>
                                       <td>From</td>
                                       <td><a ng-href="Address.html?addr={{transactionInformation.from_address}}&currency={{currency}}">{{transactionInformation.from_address}}</a></td>
                                    </tr>
                                    <tr>
                                       <td>To</td>
                                       <td><a ng-href="Address.html?addr={{transactionInformation.to_address}}&currency={{currency}}">{{transactionInformation.to_address}}</a></td>
                                    </tr>
                                    <tr>
                                       <td>Currency</td>
                                       <td>{{transactionInformation.currency_str}}</td>
                                       </td>
                                    </tr>
                                    <tr>
                                       <td>Amount</td>
                                       <td>{{transactionInformation.formatted_amount}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                           <div class="col-md-6">
                              <table class="table table-condensed">
                                 <caption>Information</caption>
                                 <tbody>
                                    <tr>
                                       <td>Transaction type</td>
                                       <td>
                                          <img class="round-corner {{transactionInformation.color}} iconPopupInit"
                                             src="ico/{{transactionInformation.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{transactionInformation.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          {{transactionInformation.tx_type_str}}
                                       </td>
                                    </tr>
                                    <tr>
                                       <td>Included in block</td>
                                       <td>{{transactionInformation.block}}</td>
                                    </tr>
                                    <tr>
                                       <td>Index in block</td>
                                       <td>{{transactionInformation.index}}</td>
                                    </tr>
                                    <tr>
                                       <td>Block time</td>
                                       <td>{{transactionInformation.tx_time | date:'yyyy-MM-dd HH:mm:ss UTC'}}</td>
                                    </tr>
                                    <tr>
                                       <td>Transaction method</td>
                                       <td>{{transactionInformation.method}}</td>
                                    </tr>
                                    <tr>
                                       <td>Valid</td>
                                       <td ng-switch on="transactionInformation.invalid|truefalsesearch" class="{{transactionInformation.invalid|truefalsesearch}}ValidStateDiv">
                                          <div ng-switch-when="true" id="validPopup"
                                             data-content="{{reason}}" rel="popover"
                                             data-placement="bottom" data-original-title="Invalid"
                                             ng-init="makePopup()">
                                             Invalid
                                          </div>
                                          <div ng-switch-when="false">
                                             Valid
                                          </div>
                                       </td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  </div>
