//Comando em que coloca a biblioteca 'fs' a disposição para ser utilizada no codigo
const { error } = require('console');
const fs = require('fs');
const { exit } = require('process');
const { json } = require('stream/consumers');


//Nesta função utilizei do metodo de leitura do arquivo .JSON 'fs' onde o .readFile serve para ler o arquivo, dentro dos paranteses
//é passada a localização do arquivo e em seguida um 'utf-8' que seria o encoding dessa aplicação. O JSON.parse serve para passar os
//arrays de strings para objetos.
//Nesta função tambem fizemos um tratamento de erro usando o try, catch onde diz que se não executar o que está pré-definido irá 
//aparecer a mensagem de erro, que vem logo após ao console.log.
let AbrirArquivoJson = function(location) {
    let data
    try {
        data = fs.readFileSync(location, 'utf-8');
    } catch{
        console.log("O arquivo não pode ser lido")
    }
    try {
        jsonData = JSON.parse(data);
    } catch (e) {
        if ( e instanceof SyntaxError){
            console.log("O arquivo não pode ser lido pois não é um arquivo JSON")
        }
    }
    if (jsonData.length == 0) {
        throw new Error ("O array esta vazio")
    }
    for (let i = 0; i < jsonData.length; i++){
        if (typeof jsonData[i].name != "string") 
            throw new Error("O atributo name precisa ser do tipo string, e o objeto numero " + i + " o atributo nome não é uma string")
        if (typeof jsonData[i].id != "number")
            throw new Error("O atributo id precisa ser do tipo number")
    }
    
    return jsonData
}


//Função utilizada para correção da nomenclatura dos itens, foi utilizado um for para englobar todos os itens do arquivo .JSON,
//e depois para substituir os bugs das letras foi utilizado o .replace trocando as letras quebradas para as corretas.
let ArrumarNomes = function(jsonArray) {
    for (let i = 0; i < jsonArray.length; i++) {
        jsonArray[i].name = jsonArray[i].name.replace(/æ/g, "a").replace(/ø/g, "o").replace(/¢/g, "c").replace(/ß/g, "b")
    }
    return jsonArray
}


//Função utilizada para transformar os preços que com o bug viraram Strings para Numbers, nele também utilizamos o for para englobar todos os itens do arquivo,
// e depois pegando especificamente os preços do documento que seriam o .price, utilizamos do Number.parseFloat para passar todas as strings para numbers
let ArrumarPrecos = function(jsonArray){
    for (let i = 0; i < jsonArray.length; i++) {
        jsonArray[i].price = Number.parseFloat(jsonArray[i].price)
    }
    return jsonArray
}


//Função utilizada para tratar quantidades que com o bug foram removidas de alguns itens, essas que foram removidas tinha por valor o zero,
//então novamente utilizamos o for para englobar todo o arquivo e depois coloquei o if para dizer que se o item quantity não existisse ou
//fosse igual a 'undefined' então o sistema colocaria por padrão a quantidade zero em estoque. 
let ArrumarQtd = function(jsonArray){
    for (let i = 0; i < jsonArray.length; i++) {
        if (typeof jsonArray[i].quantity === 'undefined')
            jsonArray[i].quantity = 0
    }
    return jsonArray
}


let OrdenarEPrintar=function(jsonArray){
    try{
        jsonArray.sort((a, b) => a.category.localeCompare(b.category) || a.id - b.id);
    } catch (e) {
        if (e instanceof TypeError)
            console.log("Parametro recebido precisa ser uma array")
    }
    for (let i = 0; i < jsonArray.length; i++) {
        console.log(jsonArray[i].name)
    }  
}


//Essa função foi utilizada para calcular o valor de estoque de cada item, para isso por primeiro criei uma variavel categorias = {} para onde os valores 
//vão ir, por segundo coloquei um for para englobar todos os elementos, depois foi colocado um if para dizer que se o codigo a frente for verdadeiro para 
//executar o da linha de baixo. Dentro desse if coloquei um "(String(categorias[jsonArray[i].category]) === 'undefined')" onde basicamente o que diz é
//se a variavel categorias for igual a 'undefined' vai executar o codigo de baixo que diz para setar a variavel categorias para 0, a string na frente do
//codigo serve para forçar a variavel categoria a ser uma string.
//Depois disso para calcular o valor do estoque de cada categoria fiz variavel categoria += o preço vezes a quantidade, no codigo o Nymber.parseFloat serve
//para dizer que o valor tem que ser dado em numero e não em string, neste codigo assim como os de cima a parte do "jsonArray[i].elementoEscolhido" serve 
//para englobar todos os elemento com o mesmo nome do arquivo .JSON.
let CalculaEstoquePorCategoria=function(jsonArray){
    categorias = {}
    for (let i = 0; i < jsonArray.length; i++) {
        if (String(categorias[jsonArray[i].category]) === 'undefined')
            categorias[String(jsonArray[i].category)] = 0

        categorias[String(jsonArray[i].category)] += Number(Number.parseFloat(jsonArray[i].price) * jsonArray[i].quantity)
    }
    return categorias
}


//algoritmo principal para organizar o codigo na hora de imprimir as funções,
//onde deixa bem visivel o que é o que em cada parte.
let dados = AbrirArquivoJson('./broken-database.json')
dados = ArrumarNomes(dados)
dados = ArrumarPrecos(dados)
dados = ArrumarQtd(dados)

console.log("\nExibindo dados arrumados")
console.log(dados)

console.log("Exibindo nomes ordenados\n")
OrdenarEPrintar(dados)

var categorias = CalculaEstoquePorCategoria(dados)
console.log("\nExibindo valor de estoque")
console.log(categorias)


//Metodo utilizado para copiar o codigo e criar um arquivo .JSON atualizado com todo o banco de dados corretos.
//O "fs.writefile" serve para indicar que você quer reescrever o codigo criado, a "saida.json" é para onde esses dados irão,
//"JSON.stringify(dados,null,2)" é para trasformar os itens de objetos para strings e tambem para formatar a forma que o codigo,
//vai ser impresso no proximo arquivo.
//a parting do encoding e flag servem para mostrar o padrão que seria o utf-8 e o flag "w" para sempre que o arquivo for atualizado
//so reescrever sobre o outro, e em baixo são as mensagens caso de erro, ou caso de tudo certo.
fs.writeFile("saida.json", JSON.stringify(dados,null,2),
  {
    encoding: "utf8",
    flag: "w",
    mode: 0o666
  },(err) => {
    if (err)
      console.log(err);
    else {
      console.log("\nArquivo gravado com sucesso!");
    }
});

