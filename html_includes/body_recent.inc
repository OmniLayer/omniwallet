            <div class="container page-container">
               <div class="row">
                  <div class="no-fixed col-sm-9 col-sm-push-3 col-md-10 col-md-push-2">
                     <div class="inner">
                        <div ng-controller="BTCController" ng-init="getData(1)">
                           <table class="table table-striped table-hover table-condensed">
                              <caption>Latest {{currency}} transactions</caption>
                              <thead>
                                 <tr>
                                    <th>Transaction</th>
                                    <th>Details</th>
                                    <th>Amount</th>
                                    <th>Block time</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 <tr ng-repeat="trans in transactions">
                                    <td ng-switch on="trans.icon">
                                       <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                          src="ico/{{trans.icon}}24t.png"
                                          ng-init="createIconPopup()"
                                          data-content="{{trans.icon_text}}" rel="popover"
                                          data-placement="bottom"
                                          alt=""
                                          />
                                       <span ng-switch-when="selloffer">
                                       <a ng-href='selloffer.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                       <span ng-switch-when="sellaccept">
                                       <a ng-href='sellaccept.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                       <span ng-switch-when="simplesend">
                                       <a ng-href='simplesend.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                       <span ng-switch-when="exodus">
                                       <a ng-href='exodus.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                       <span ng-switch-when="unknown">
                                       <a ng-href='btcpayment.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                       <span ng-switch-default>
                                       <a ng-href='btcpayment.html?tx={{trans.tx_hash}}&currency={{currency}}'>{{trans.tx_hash | characters:10}}
                                       </a>
                                       </span>
                                    </td>
                                    <td ng-switch on="trans.icon">
                                       <span ng-switch-when="selloffer">{{trans.formatted_price_per_coin}} ฿/{{currency}}
                                       </span>
                                       <span ng-switch-when="sellaccept">{{trans.formatted_price_per_coin}} ฿/{{currency}}
                                       </span>
                                       <span ng-switch-when="simplesend">
                                       <a href='Address.html?addr={{trans.to_address}}&currency={{currency}}'>{{trans.to_address}}</a>
                                       </span>
                                       <span ng-switch-when="exodus">
                                       <a href='Address.html?addr={{trans.to_address}}&currency={{currency}}'>{{trans.to_address}}</a>
                                       </span>
                                       <span ng-switch-default>
                                       </span>
                                    </td>
                                    <td>{{trans.formatted_amount}}</td>
                                    <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                 </tr>
                              </tbody>
                           </table>
