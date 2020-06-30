import React from 'react';
import './App.css';
import axios from 'axios';
import {Line} from 'react-chartjs-2';


class App extends React.Component {

  constructor(props) {
    debugger;
    super(props);
    this.state = {
      pageNumber: 0,
      data: this.props.data,
      totalPages: this.props.totalPages,
      hidedenNews: [],
      upVote: 0,
      graphData: {},
      upVoteArr: []
    }
  }
  
  componentDidMount() {
    
    this.setState({
      pageNumber: Number(window.location.href.split('/')[4]),
      upVoteArr: localStorage.getItem('upVoteArr') ? localStorage.getItem('upVoteArr') : [],
      hidedenNews: localStorage.getItem('hidedenNews') ? localStorage.getItem('hidedenNews') : []
    }, () => {
      this.getGraphData(this.state.data);
    });
  }

  getGraphData (data) {
    let dataVotes=[], dataId=[];
    const _this = this;
    const xyz = data.filter((data1, id)=> {
      return !(_this.state.hidedenNews.indexOf(data1.objectID) > -1);
    });
    
    const abc = xyz.map((data1, id)=> {
      if(this.state.upVote === data1.objectID) {
        data1.points = data1.points + 1;
        this.setState({
          upVoteArr: [...this.state.upVoteArr, data1.objectID]
        }, () => {
          localStorage.setItem('upVoteArr', this.state.upVoteArr);
        });
      }
      return data1;
    });

    abc.forEach(data1 => {  
        dataVotes.push(data1.points);
        dataId.push(data1.objectID);
    });

    
    this.setState({
      graphData: {
        labels: dataId,
        datasets: [
          {
            label: 'Rainfall',
            fill: false,
            lineTension: 0.5,
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0, 181, 204, 1)',
            borderWidth: 3,
            data: dataVotes
          }
        ]
      }
    })
  }
  
  getData (data) {
    if (data === 'next') {
      this.setState({
        pageNumber: this.state.pageNumber + 1
      }, this.updation.bind(this));
    } else {
      this.setState({
        pageNumber: this.state.pageNumber - 1
      }, this.updation.bind(this))
    }
  }

  updation () {
    axios.get(`https://hn.algolia.com/api/v1/search?page=${this.state.pageNumber}&hitsPerPage=30&tags=story`)
    .then(res => {
      this.setState({ data: res.data.hits, totalPages: res.data.nbPages });
      this.getGraphData(res.data.hits);
    });
    //localStorage.setItem('pageNumber', this.state.pageNumber);
    window.history.replaceState(null, null, "/news/"+this.state.pageNumber);
  }

  hideNews (data) {
    this.setState({
      hidedenNews: [...this.state.hidedenNews, data]
    }, ()=> {
      localStorage.setItem('hidedenNews', this.state.hidedenNews);
    });
    this.getGraphData(this.state.data);
  }
  
  addUpVote (id) {
    this.setState({
      upVote: id
    }, () => {
      this.getGraphData(this.state.data);
    });
  }

  render() {
    //console.log(this.state.data, 'data state');
    const _this = this;
    console.log(_this, '_this');
    const xyz = this.state.data.filter((data, id)=>{
      return !(_this.state.hidedenNews.indexOf(data.objectID) > -1);
    });
    
    return (
      <div className="App">
        <div className="table-responsive">
        <table>
          <thead>
          <tr>
            <th>Comments</th>
            <th>Vote Count</th>
            <th>Upvote</th>
            <th>News Details</th>
          </tr>
          </thead>
          <tbody>
          {xyz && xyz.map((data, idx) => 
            {
              return (
                    <tr key={idx} id={data.objectID}>
                    <td>{data.num_comments}</td>
                    <td>{data.points}</td>
                    <td onClick={this.addUpVote.bind(this, data.objectID)}>^</td>
                    <td>
                      <span>{data.title}</span>
                      <span>({data.url}) By</span>
                      <span>{data.author}</span>
                      <span>{data.created_at}</span>
                      <span onClick={this.hideNews.bind(this, data.objectID)}>[ hide ]</span></td>
                  </tr>
                  )
            
              }
          )}
          </tbody>
        </table>
        </div>
        <div className="btns">
          <button type="button" disabled={this.state.pageNumber === 0 ? 'disabled' : ''} onClick={this.getData.bind(this, 'prev')}>Prev</button>
          <button type="button" disabled={this.state.pageNumber === this.state.totalPages ? 'disabled' : ''} onClick={this.getData.bind(this, 'next')}>Next</button>
        </div>
        <div>
        <Line
          data={this.state.graphData}
          options={{
            title:{
              display:true,
              text:'Hacker News',
              fontSize:20
            },
            legend:{
              display:true,
              position:'right'
            }
          }}
        />
      </div>
      </div>
    );
  }
}

export default App;
