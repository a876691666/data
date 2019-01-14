import DataFactory from '../dataFactory'

const conso = val => console.log(JSON.stringify(val));
const { Factory, Random } = DataFactory;

const randomNumber1 = Random.number(0, 100, 0);
const randomNumber2 = Random.number(0, 1000, 0);
const randomString1 = Random.str('abcdefghijklmnopqrstuvwxyz', randomNumber1());

const graphData = {
  nodes: Factory.List(randomString1, 1000),
  links: Factory.List({
    source: randomNumber2,
    target: randomNumber2,
  }, 500)
};

conso(graphData);