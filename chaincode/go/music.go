package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct{}

type Wallet struct { //지갑 구조체
	Name  string `json:"name"`
	ID    string `json:"id"`
	Token string `json:"token"`
}

type Ascode struct { //악성코드 구조체
	Filehash    string `json:"filehash"`
	Uploader  string `json:"uploader"`
//	Time    string `json:"time"`
//	Ipfs	string `json:"ipfs"`
//	Country	string `json:"country"`
//	Os		string `json:"os"`
	WalletID string `json:"walletid"`
}

type CodeKey struct { //악성코드 고유번호 중복안되게 설정하기 위해
	Key string
	Idx int
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) pb.Response { //체인코드를 인스턴스화 할 때 호출되는 함수이다.
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response { //Invoke함수, 체인코드 호출을 제어, 실제 체인코드가 처리할 내용
	function, args := APIstub.GetFunctionAndParameters()

	if function == "initWallet" {
		return s.initWallet(APIstub)
	} else if function == "getWallet" {
		return s.getWallet(APIstub, args)
	} else if function == "addCode" {
		return s.addCode(APIstub, args)
	} else if function == "getAllCode" {
		return s.getAllCode(APIstub)
	} else if function == "addCoin" {
		return s.addCoin(APIstub, args)
	}
	fmt.Println("Please check your function : " + function)
	return shim.Error("Unknown function")
}

func (s *SmartContract) initWallet(APIstub shim.ChaincodeStubInterface) pb.Response { //지갑 초기화시 호출

	//Declare wallets
	seller := Wallet{Name: "Hyper", ID: "1Q2W3E4R", Token: "100"}    //현재는 업로더 역할을 실행
	customer := Wallet{Name: "Ledger", ID: "5T6Y7U8I", Token: "200"} //현재는 평가자의 역할 실행

	// Convert seller to []byte
	SellerasJSONBytes, _ := json.Marshal(seller)
	err := APIstub.PutState(seller.ID, SellerasJSONBytes)
	if err != nil {
		return shim.Error("Failed to create asset " + seller.Name)
	}
	// Convert customer to []byte
	CustomerasJSONBytes, _ := json.Marshal(customer)
	err = APIstub.PutState(customer.ID, CustomerasJSONBytes)
	if err != nil {
		return shim.Error("Failed to create asset " + customer.Name)
	}

	return shim.Success(nil)
}

func (s *SmartContract) getWallet(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {

	walletAsBytes, err := APIstub.GetState(args[0]) //WalletID를 GetState로 받아옴
	if err != nil {
		fmt.Println(err.Error())
	}

	wallet := Wallet{}
	json.Unmarshal(walletAsBytes, &wallet)

	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	if bArrayMemberAlreadyWritten == true {
		buffer.WriteString(",")
	}
	buffer.WriteString("{\"Name\":")
	buffer.WriteString("\"")
	buffer.WriteString(wallet.Name)
	buffer.WriteString("\"")

	buffer.WriteString(", \"ID\":")
	buffer.WriteString("\"")
	buffer.WriteString(wallet.ID)
	buffer.WriteString("\"")

	buffer.WriteString(", \"Token\":")
	buffer.WriteString("\"")
	buffer.WriteString(wallet.Token)
	buffer.WriteString("\"")

	buffer.WriteString("}")
	bArrayMemberAlreadyWritten = true
	buffer.WriteString("]\n")

	return shim.Success(buffer.Bytes())

}

func generateKey(APIstub shim.ChaincodeStubInterface, key string) []byte { //음원등록시 고유 번호 생성

	var isFirst bool = false

	musickeyAsBytes, err := APIstub.GetState(key) //최근 키값 불러옴
	if err != nil {
		fmt.Println(err.Error())
	}

	musickey := CodeKey{}
	json.Unmarshal(musickeyAsBytes, &musickey)
	var tempIdx string
	tempIdx = strconv.Itoa(musickey.Idx)
	fmt.Println(musickey)
	fmt.Println("Key is " + strconv.Itoa(len(musickey.Key)))
	if len(musickey.Key) == 0 || musickey.Key == "" { //키값이 을을 경우->첫번째 키값
		isFirst = true
		musickey.Key = "AS"
	}
	if !isFirst {
		musickey.Idx = musickey.Idx + 1 //musickey값 1씩 증가 시킴
	}

	fmt.Println("Last MusicKey is " + musickey.Key + " : " + tempIdx)

	returnValueBytes, _ := json.Marshal(musickey) //json 타입로로 반환

	return returnValueBytes
}

func (s *SmartContract) addCode(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}

	var musickey = CodeKey{} //최근 키값 받음
	json.Unmarshal(generateKey(APIstub, "latestKey"), &musickey)
	keyidx := strconv.Itoa(musickey.Idx)
	fmt.Println("Key : " + musickey.Key + ", Idx : " + keyidx)

	var music = Ascode{Filehash: args[0], Uploader: args[1], WalletID: args[2]} //파라미터 값들 json 변환
	musicAsJSONBytes, _ := json.Marshal(music)

	var keyString = musickey.Key + keyidx
	fmt.Println("musickey is " + keyString)

	err := APIstub.PutState(keyString, musicAsJSONBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record music catch: %s", musickey))
	}

	musickeyAsBytes, _ := json.Marshal(musickey) //음원 번호 최신 값으로 업데이트
	APIstub.PutState("latestKey", musickeyAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) getAllCode(APIstub shim.ChaincodeStubInterface) pb.Response {

	// Find latestKey
	musickeyAsBytes, _ := APIstub.GetState("latestKey")
	musickey := CodeKey{}
	json.Unmarshal(musickeyAsBytes, &musickey)
	idxStr := strconv.Itoa(musickey.Idx + 1)

	var startKey = "AS0"
	var endKey = musickey.Key + idxStr
	fmt.Println(startKey)
	fmt.Println(endKey)

	resultsIter, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIter.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for resultsIter.HasNext() {
		queryResponse, err := resultsIter.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")

		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]\n")
	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) addCoin(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	var tokenToKey int // Asset holdings
	var musicprice int               // Transaction value
	var err error

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	musicAsBytes, err := APIstub.GetState(args[1])
	if err != nil {
		return shim.Error(err.Error())
	}

	music := Ascode{}
	json.Unmarshal(musicAsBytes, &music)
	musicprice, _ = strconv.Atoi(args[0])

	SellerAsBytes, err := APIstub.GetState(music.WalletID)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if SellerAsBytes == nil {
		return shim.Error("Entity not found")
	}
	seller := Wallet{}
	json.Unmarshal(SellerAsBytes, &seller)
	tokenToKey, _ = strconv.Atoi(seller.Token)

	seller.Token = strconv.Itoa(tokenToKey + musicprice)     //업로더 토큰 추가
	updatedSellerAsBytes, _ := json.Marshal(seller)
	APIstub.PutState(music.WalletID, updatedSellerAsBytes)

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")
	buffer.WriteString(", \"Uploader Token\":")
	buffer.WriteString("\"")
	buffer.WriteString(seller.Token)
	buffer.WriteString("\"")

	buffer.WriteString("}")
	buffer.WriteString("]\n")

	return shim.Success(buffer.Bytes())
}

func main() {

	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}