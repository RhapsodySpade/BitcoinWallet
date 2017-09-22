import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import Moment from 'react-moment';

class SearchBar extends Component {
    constructor(props){
        super(props);

        this.state = {
            address: '',
        };

        this.apiUrl = 'https://localhost:3000/blockchain/v2/btc/addresses';
    }

    fetchInfos = () => {
        axios.get(`${this.apiUrl}/${this.state.address}/transactions?noToken=true`)
            .then((res) => {
                this.props.action(res.data.txs, this.state.address, true);
            })
        ;
    };

    render() {
        return (
            <div>
                <div>
                    <input type="text" style={{width:"40em"}}
                                            onChange={({target: {value}}) => {this.setState({address: value});
                }} />
                    <input type="button" value="Show me my balance" onClick={this.fetchInfos}
                    />
                </div>
            </div>
        );
    }
}

class List extends Component {

    handleClick = () => {
        this.props.action([], '', false);
    };

    render() {
        const {txs, balance} = this.props;
        return (
            <div>
                <div>
                    <h3>{`BTC: ${balance}`}</h3>
                    Your Balance <br /> <br />
                    <input
                        type="button"
                        value="Change my address"
                        onClick={this.handleClick}
                    />
                </div>
                <br /> <br />
                <table style={{width:"100%"}}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Hash</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map(t => <Item tr={t} key={t.hash} />)}
                    </tbody>
                </table>
            </div>
        );
    }
}

class Item extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {tr} = this.props;

        return (
            <tr>
                <td> <Moment format="ddd D, MM/YY, HH:mm">{tr.received_at}</Moment></td>
                <td> {tr.hash}</td>
                <td> {tr.movement}</td>
            </tr>
        );
    }

}

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            search: true,
            txs: [],
            currentAddress: '',
            balance: 0,
            itemList: [],
        }
        this.handler = this.handler.bind(this)
    }

    _getMovement(item){
        let valInput = 0;
        let valOutput = 0;

        item.inputs.map((input) => {
            if (input.address === this.state.currentAddress ) {
                valInput += input.value
            }
        });
        item.outputs.map((output) => {
            if (output.address === this.state.currentAddress ) {
                valOutput += output.value
            }
        });
        return (valOutput - valInput);
    }

    _getItemList(list){
        return list.map((item) => ({
            hash: item.hash,
            received_at: item.received_at,
            movement: this._getMovement(item)/100000000,
        }));
    }

    handler(txs, currentAddress) {
        this.setState({
            search: !this.state.search,
            txs,
            currentAddress,
        })

        if (txs.length > 0){
            const itemList = this._getItemList(txs);
            const balance = itemList.reduce((acc, item) => acc + item.movement, 0);

            this.setState({
                itemList,
                balance,
            })
        }
    }

    render() {
    return (
      <div className="App">
          {this.state.search === true &&
              <div>
                      <h1>Ledger Test App</h1>
                      Enter a bitcoin address to compute balance
                  <SearchBar action={this.handler}/>
              </div>
          }
          {this.state.search === false &&
                <List txs={this.state.itemList} action={this.handler} balance={this.state.balance} />
          }
      </div>
    );
  }
}

export default App;
