import React from 'react';
import {ListGroup, Table} from 'react-bootstrap';
import logo from './brewery.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const Header=(props) => {
    return (
        <header className="App-header">
            <img src={props.image} className="App-logo" alt="logo"/>
        </header>
    );
};

const Bottle=(props) => {
    return (
        <tr className="bottleBlock" id={props.id}>
            <td><img src={props.image_url} alt={props.name}/></td>
            <td>{props.name}</td>
            <td>{props.volume.value} {props.volume.unit}</td>
            <td className="text-left">{props.tagline}</td>
            <td className="action">
                <button type="button" className="btn btn-warning" onClick={() => props.viewBottle(props.id)}>View more
                </button>
            </td>
        </tr>
    );
};

const ViewBottle=(props) => {
    const showIngredients=(ingredientsObject) => {
        let results=[];
        Object.keys(ingredientsObject).map(key => {
            let ingredients=bottle.ingredients[key];
            if (typeof ingredients === 'object') {
                ingredients.map(item => {
                    results.push(item.name);
                })
            } else {
                results.push(ingredients);
            }
        });
        return results.join(', ');
    };

    let bottle=props.bottle;

    return (
        <div className="container currentBottle">
            <div className="mt-3">
                <button type="button" className="btn btn-dark btn-sm" onClick={() => props.handleBack()}>&larr; Go
                    back
                </button>
            </div>
            <header>
                <h1 className="text-center"> {bottle.name} </h1>
            </header>

            <div className="row mt-5">
                <div className="col-xs-12 col-sm-2 offset-sm-2">
                    <figure className="text-center">
                        <img src={bottle.image_url} alt={bottle.name}/>
                    </figure>
                </div>
                <div className="col-xs-12 col-sm-6">
                    <ListGroup>
                        <ListGroup.Item>
                            <strong>Volume: </strong>
                            {bottle.volume.value} {bottle.volume.unit}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>First brewed: </strong>
                            {bottle.first_brewed}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>ABV: </strong>
                            {bottle.abv}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>IBU: </strong>
                            {bottle.ibu}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Ingredients: </strong>
                            {showIngredients(bottle.ingredients)}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Food pairing: </strong>
                            {bottle.food_pairing}
                        </ListGroup.Item>
                    </ListGroup>
                    <h5 className="mt-3">Description:</h5>
                    <p className="mt-2">{bottle.description}</p>
                </div>
            </div>
        </div>
    );
};

class App extends React.Component {
    state={
        bottles: [],
        bottle: null,
        current_page: 1,
        filteredBeers: [],
        q: ''

    };

    componentDidMount() {
        this.makeHttpRequestWithPage(1);

    };

    makeHttpRequestWithPage=async pageNumber => {
        let response=await fetch(`https://api.punkapi.com/v2/beers?brewed_before=11-2012&abv_gt=6&page=${pageNumber}&per_page=10`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        const data=await response.json();

        this.setState({
            bottles: [...this.state.bottles, ...data],
            filteredBeers: [...this.state.filteredBeers, ...data]
        });
    };

    handleViewBottle=(id) => {
        this.setState(
            {
                bottle: this.state.bottles.find(bottle => bottle.id === id)
            });
    };

    loadMoreBeer=() => {
        let nextPage=this.state.current_page + 1;
        this.setState(
            {
                current_page: nextPage
            }
        );
        this.makeHttpRequestWithPage(nextPage);
    };

    handleBack=() => {
        this.setState(
            {
                bottle: null
            });
    };

    onChange=(event) => {
        const q=event.target.value.toLowerCase();
        this.setState({q}, () => this.filterList());
    };

    filterList=() => {
        let beers=this.state.bottles;
        let q=this.state.q;

        beers=beers.filter(function (beer) {
            return beer.name.toLowerCase().indexOf(q) != -1; // returns true or false
        });
        this.setState({filteredBeers: beers});
    };

    render() {
        return (
            <div className="App">

                <div className="container-fluid">
                    {this.state.bottle === null ?
                        <React.Fragment>
                            <Header
                                image={logo}
                            />
                            <div className="search mt-1 mb-1">
                                <input className="form-control"
                                       id="myInput"
                                       type="text"
                                       placeholder="Search beer.."
                                       onChange={this.onChange}/>
                            </div>
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Volume</th>
                                    <th>Tagline</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.state.filteredBeers.map(bottle =>
                                    <Bottle
                                        key={bottle.id}
                                        id={bottle.id}
                                        image_url={bottle.image_url}
                                        name={bottle.name}
                                        tagline={bottle.tagline}
                                        volume={bottle.volume}
                                        viewBottle={this.handleViewBottle}
                                    />
                                )
                                }
                                </tbody>
                            </Table>
                            <div className="text-center">
                                <button type="button"
                                        className="btn btn-info btn-lg"
                                        onClick={this.loadMoreBeer}>
                                    Load More
                                </button>
                            </div>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <ViewBottle
                                bottle={this.state.bottle}
                                handleBack={this.handleBack}
                            />
                        </React.Fragment>
                    }
                </div>
            </div>
        )
    };
}

export default App;
