            <div class="container page-container">
               <div class="row">
                  <div class="no-fixed col-sm-9 col-sm-push-3 col-md-10 col-md-push-2">
                     <div class="inner" ng-controller="AdressController" ng-init="getAddressData()">
                        <div class="row">
                           <div class="col-xs-12 col-md-8">
                              <table class="table table-striped table-hover table-condensed">
                                 <tr>
                                    <td class="captionTd1">Address</td>
                                    <td><span class="pull-right">{{theAddress}}</span></td>
                                 </tr>
                                 <tr>
                                    <td class="captionTd1">Tools</td>
                                    <td class="btnCell">
                                       <button type="button" ng-click="AddToWalletClick()" class="btc-tbl-btn pull-right btn btn-success btn-xs">Add to wallet</button>
                                       <button type="button" ng-click="SendClick()" class="btc-tbl-btn pull-right btn btn-success btn-xs">Send here</button>
                                    </td>
                                 </tr>
                              </table>
                           </div>
                           <div class="qrcode-address col-xs-6 col-md-4">
                              <div id="qrcode" style="float:right;"></div>
                           </div>
                        </div>
                        <div class="row">
                           <div class="col-md-6">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Balance Information</caption>
                                 <tbody>
                                    <tr>
                                       <td>Final balance</td>
                                       <td><strong>{{addressInformation.balance}}</strong>
                                       </td>
                                    </tr>
                                    <tr>
                                       <td>Bought via Exodus</td>
                                       <!-- 1 is for Mastercoin and 2 is for Test Mastercoint-->
                                       <td>{{addressInformation.total_exodus}}</td>
                                    </tr>
                                    <tr>
                                       <td>Payments received</td>
                                       <td>{{addressInformation.total_received}}</td>
                                    </tr>
                                    <tr>
                                       <td>Payments sent</td>
                                       <td>{{addressInformation.total_sent}}</td>
                                    </tr>
                                    <tr>
                                       <td>Coins bought</td>
                                       <td>{{addressInformation.total_bought}}</td>
                                    </tr>
                                    <tr>
                                       <td>Coins sold</td>
                                       <td>{{addressInformation.total_sold}}</td>
                                    </tr>
                                    <tr>
                                       <td>Open accept</td>
                                       <td>{{addressInformation.total_sell_accept}}</td>
                                    </tr>
                                    <tr>
                                       <td>Open sell</td>
                                       <td>{{addressInformation.total_sell_offer}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                           <div class="col-md-6">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Other Information</caption>
                                 <tbody>
                                    <tr>
                                       <td>Currency</td>
                                       <td><strong>{{currency}}</strong></td>
                                    </tr>
                                    <tr>
                                       <td>Exodus transactions</td>
                                       <td>{{addressInformation.exodus_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Incoming transactions</td>
                                       <td>{{addressInformation.received_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Outgoing transactions</td>
                                       <td>{{addressInformation.sent_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Bought transactions</td>
                                       <td>{{addressInformation.bought_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Sold transactions</td>
                                       <td>{{addressInformation.sold_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Open accept transaction</td>
                                       <td>{{addressInformation.accept_transactions.length}}</td>
                                    </tr>
                                    <tr>
                                       <td>Open sell transaction</td>
                                       <td>{{addressInformation.offer_transactions.length}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.exodus_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Exodus transactions ({{addressInformation.exodus_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Amount</th>
                                       <th>Date</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.exodus_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="exodus.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.sold_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Sold coins ({{addressInformation.sold_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Amount</th>
                                       <th>Date</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.sold_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="selloffer.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.bought_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Bought coins ({{addressInformation.bought_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Amount</th>
                                       <th>Date</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.bought_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="sellaccept.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.offer_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Sell offers ({{addressInformation.offer_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Amount</th>
                                       <th>Date</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.offer_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="selloffer.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.accept_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-striped table-hover table-condensed">
                                 <caption>Sell accepts ({{addressInformation.accept_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Amount</th>
                                       <th>Date</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.accept_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="sellaccept.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.received_transactions.length">
                           <div class="col-md-12">
                              <table class="table table-condensed">
                                 <caption>Received transactions ({{addressInformation.received_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Source address</th>
                                       <th>Amount</th>
                                       <th>Block time</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.received_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="simplesend.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td><a ng-href="Address.html?addr={{trans.from_address}}&currency={{currency}}">{{trans.from_address}}</a></td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                        <div class="row" ng-show="addressInformation.sent_transactions.length">
                           <!--SENT TRANSACTIONS-->
                           <div class="col-md-12">
                              <table class="table table-condensed">
                                 <caption>Sent transactions ({{addressInformation.sent_transactions.length}})</caption>
                                 <thead>
                                    <tr>
                                       <th>Transaction</th>
                                       <th>Receiving address</th>
                                       <th>Amount</th>
                                       <th>Block time</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    <tr ng-repeat="trans in addressInformation.sent_transactions">
                                       <td>
                                          <img class="icon24 round-corner {{trans.color}} iconPopupInit"
                                             src="ico/{{trans.icon}}24t.png"
                                             ng-init="createIconPopup()"
                                             data-content="{{trans.icon_text}}" rel="popover"
                                             data-placement="bottom"
                                             alt="" />
                                          <a ng-href="simplesend.html?tx={{trans.tx_hash}}&currency={{currency}}">{{trans.tx_hash | characters:10}}</a>
                                       </td>
                                       <td><a ng-href="Address.html?addr={{trans.to_address}}&currency={{currency}}">{{trans.to_address}}</a></td>
                                       <td>{{trans.formatted_amount}}</td>
                                       <td>{{trans.tx_time | date:'dd MMM HH:mm'}}</td>
                                    </tr>
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>
                  </div>

