package main
import (
	"fmt"
	"strconv"
	"bytes"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)
type SmartContract struct {}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) pb.Response {
	function, args := APIstub.GetFunctionAndParameters()

	if function == "setWallet" {		//지갑생성cc
		return s.setWallet(APIstub, args)
	} else if function == "getWallet" {	//지갑정보등록cc
		return s.getWallet(APIstub, args)
	} else if function == "addCode" {	//악성코드 등록cc
		return s.addCode(APIstub, args)
	} else if function == "addCoin" {	//평가시 코인지급cc
		return s.addCoin(APIstub, args)
	} else if function == "getAllCode" {//저장된 모든 코드 조회cc
		return s.getAllCode(APIstub)
	} else if function == "addComment" {//악성코드에 코멘트 등록
		return s.addComment(APIstub, args)
	} else if function == "getComment" {//악성코드에 코멘트 등록
		return s.getComment(APIstub)
	}
	fmt.Println("Please check your function : "+ function)
	return shim.Error("Unknown function")
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error starting Simple chaincod: %s", err)
	}
}

//지갑 정보 등록 구조체
type Wallet struct {
	Name string `json:"name"`
	ID string `json:"id"`		//Q.WalletID량 ID랑 똑같은걸로 할까?
	Token string `json:"token"`
}


//지갑 생성
func (s *SmartContract) setWallet(stub shim.ChaincodeStubInterface, args []string) pb.Response {	//WalletID받으면 Token 0으로 시작

	if len(args) != 2 {		//WalletID,Token=0
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	A := Wallet{Name: args[0], ID: args[1], Token: "0"}
	AasJSONBytes, _ := json.Marshal(A)
	err := stub.PutState(A.ID, AasJSONBytes)
//	fmt.Println("Your WalletID :" + A.WalletID + ", Token : 0")	출력x

	if err != nil {
		return shim.Error("Failed to create wallet " + A.ID)
	}
	return shim.Success(nil)
}
//특정 지갑정보 확인 getWallet()
func (s *SmartContract) getWallet(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	
	if len(args) != 1 {		//WalletID
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	walletAsBytes, err := stub.GetState(args[0])	//args[0]:WalletID
	if err != nil {
		fmt.Println(err.Error())
	}
	wallet := Wallet{}	//구조체받아옴
	json.Unmarshal(walletAsBytes, &wallet)	//json->구조체형식으로
	
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadryWritten := false	//이전에 쓰인게 있다면
	if bArrayMemberAlreadryWritten == true {
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
	bArrayMemberAlreadryWritten = true		//쓰인게 있다는 표시
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())
} 

func (s *SmartContract) addCoin(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var A string
	var TokenA int	//토큰 보유양
	var X int		//추가될 토큰양
	var err error

	if len(args) != 2 {		//WalletID
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	A = args[0]	//Id
	X,_ = strconv.Atoi(args[1])
	AAsBytes, err := stub.GetState(A)	//A의 정보
	if err != nil {
		return shim.Error(err.Error())
	}
	if AAsBytes == nil {
		return shim.Error("Entity not found")
	}
	walletA := Wallet{}
	json.Unmarshal(AAsBytes, &walletA)
	TokenA, _ = strconv.Atoi(string(walletA.Token))
	walletA.Token = strconv.Itoa(TokenA + X)
	updatedAAsBytes, _ := json.Marshal(walletA)
	stub.PutState(args[0],updatedAAsBytes)


	fmt.Printf("ID:"+walletA.ID+", Token: "+walletA.Token)
	return shim.Success(nil)
}

//악성코드 구조체
type Ascode struct{
	URL string `json:"url"`	//Filehash SHA256 오류.
	Uploader string `json:"uploader"`	//글쓴이이름
	Time string `json:"time"`			//int64?
	//Ipfs string `json:"ipfs"`
	Country string `json:"country"`
	Os string `json:"os"`
	WalletID string `json:"walletid"`
}

//악성코드 고유번호 ->등록 시 ID로 자동설정
type CodeKey struct {
	Key string 	//키를 AS로 정의해 값(Idx)을 1씩 증가시키는 방식. ->AS:0, AS:1
	Idx int	//고유번호id
}


func generateId(stub shim.ChaincodeStubInterface) []byte {		//[]byte: return할 형 적어줌.
	var isFirst bool = false	//첫번째인가?

	codekeyAsBytes, err := stub.GetState("latestKey")	//악성코드의 마지막 키값으로 원장 조회
	if err != nil {
		fmt.Println(err.Error())
	}

	codekey := CodeKey{}	//구조체 입력
	json.Unmarshal(codekeyAsBytes, &codekey)	//받아온 key,idx 정보인 codeidAsBytes를 구조체형식으로 변환
	var tempIdx string
	tempIdx = strconv.Itoa(codekey.Idx)		//정수 Idx를 문자열로 변환
	fmt.Println(codekey)
	fmt.Println("Key is " + strconv.Itoa(len(codekey.Key)))
	if len(codekey.Key) == 0 || codekey.Key == "" {	//key값이 존재x 
		isFirst = true		//첫번째 key로 간주
		codekey.Key = "AS"	//키에 AS
	}
	if !isFirst {		//처음이 아니면 id+1
		codekey.Idx = codekey.Idx + 1
	}
	fmt.Println("Last CommnetKey is " + codekey.Key + " : " + tempIdx)
	returnValueBytes,_ := json.Marshal(codekey)	//codekey를 json으로 변환

	return returnValueBytes		//codeKey를 json형식으로 반환
}
//악성코드 등록할때마다 사용되는 고유ID를 만드는 함수 generateId
func generateCId(stub shim.ChaincodeStubInterface) []byte {		//[]byte: return할 형 적어줌.
	var isFirst bool = false	//첫번째인가?

	codekeyAsBytes, err := stub.GetState("latestCKey")	//악성코드의 마지막 키값으로 원장 조회
	if err != nil {
		fmt.Println(err.Error())
	}

	codekey := CodeKey{}	//구조체 입력
	json.Unmarshal(codekeyAsBytes, &codekey)	//받아온 key,idx 정보인 codeidAsBytes를 구조체형식으로 변환
	var tempIdx string
	tempIdx = strconv.Itoa(codekey.Idx)		//정수 Idx를 문자열로 변환
	fmt.Println(codekey)
	fmt.Println("Key is " + strconv.Itoa(len(codekey.Key)))
	if len(codekey.Key) == 0 || codekey.Key == "" {	//key값이 존재x 
		isFirst = true		//첫번째 key로 간주
		codekey.Key = "CM"	//키에 AS
	}
	if !isFirst {		//처음이 아니면 id+1
		codekey.Idx = codekey.Idx + 1
	}
	fmt.Println("Last CodeKey is " + codekey.Key + " : " + tempIdx)
	returnValueBytes,_ := json.Marshal(codekey)	//codekey를 json으로 변환

	return returnValueBytes		//codeKey를 json형식으로 반환
}

//악성코드 등록 및 평가 addCode() ->addCoin을 호출
func (s *SmartContract) addCode(APIstub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 6 {	//Filehash,Uploader,Time,Ipfs,Country,Os,WalletID
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	var codekey = CodeKey{}
	json.Unmarshal(generateId(APIstub), &codekey)	//악성코드의 마지막 키값을 조회, Unmarshal()의 첫번째 인자:byte array형태의 데이터, 두번째 인자:디코딩된 값을 저장할 데이터 포인터
	keyidx := strconv.Itoa(codekey.Idx)
	fmt.Println("Key :" + codekey.Key + ", Idx : " + keyidx)

	var ascode = Ascode{URL: args[0], Uploader: args[1], Time: args[2], Country: args[3], Os: args[4], WalletID: args[5]}
	codeAsJSONBytes, _ := json.Marshal(ascode) //구조체를 json으로 변환
	var idString = codekey.Key + keyidx
	fmt.Println("AscodeID is "+idString)	//ID는 keyidx로만해서 숫자만. ex) 0 , 1 ..
	err := APIstub.PutState(idString, codeAsJSONBytes)	//ascode원장에 keyidx로 정보 등록 : id(int)가 key값.
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record ascode catch: %s",keyidx))
	}
	codekeyAsBytes, _ := json.Marshal(codekey)		//구조체를 json형식으로 변환해서 codekeyAsBytes에 저장
	APIstub.PutState("latestKey", codekeyAsBytes)	//codeis원장에 등록

	//코인 발급(글 기재시 10코인 발급)
	var A string
	var TokenA int	//토큰 보유양
	var X int		//추가될 토큰양

	A=args[5]	//Id
	X=100

	walletAsBytes, err := APIstub.GetState(args[5])	//A의 정보
	if err != nil {
		return shim.Error(err.Error())
	}

	wallet := Wallet{}
	json.Unmarshal(walletAsBytes, &wallet)
	TokenA, _ = strconv.Atoi(string(wallet.Token))
	wallet.Token = strconv.Itoa(TokenA + X)
	wallet.ID = wallet.ID
	updatedAsBytes, _ := json.Marshal(wallet)
	APIstub.PutState(A,updatedAsBytes)

	fmt.Printf("ID:" + wallet.ID + ", Token: "+wallet.Token)
	return shim.Success(nil)
}

func (s *SmartContract)  getAllCode(APIstub shim.ChaincodeStubInterface) pb.Response{
	codekeyAsBytes, _ := APIstub.GetState("latestKey")
	codekey := CodeKey{}
	json.Unmarshal(codekeyAsBytes, &codekey)
	idxStr := strconv.Itoa(codekey.Idx + 1)

	var startKey = "AS0"
	var endKey = codekey.Key + idxStr
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
type Comment struct {
	Name string `json:"name"`
	Comment string `json:"comment"`
	Level string `json:"level"`
	ID string `json:"id"`
}

func (s *SmartContract)  addComment(APIstub shim.ChaincodeStubInterface, args []string) pb.Response{
	if len(args) != 4 {	//Filehash,Uploader,Time,Ipfs,Country,Os,WalletID
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}
	var codekey = CodeKey{}
	json.Unmarshal(generateCId(APIstub), &codekey)	//악성코드의 마지막 키값을 조회, Unmarshal()의 첫번째 인자:byte array형태의 데이터, 두번째 인자:디코딩된 값을 저장할 데이터 포인터
	keyidx := strconv.Itoa(codekey.Idx)
	fmt.Println("Key :" + codekey.Key + ", Idx : " + keyidx)

	var comment = Comment{Name: args[0], Comment: args[1], Level: args[2], ID: args[3]}
	codeAsJSONBytes, _ := json.Marshal(comment) //구조체를 json으로 변환
	var idString = codekey.Key + keyidx
	fmt.Println("AscodeID is "+idString)	//ID는 keyidx로만해서 숫자만. ex) 0 , 1 ..
	err := APIstub.PutState(idString, codeAsJSONBytes)	//ascode원장에 keyidx로 정보 등록 : id(int)가 key값.
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record ascode catch: %s",keyidx))
	}
	codekeyAsBytes, _ := json.Marshal(codekey)		//구조체를 json형식으로 변환해서 codekeyAsBytes에 저장
	APIstub.PutState("latestCKey", codekeyAsBytes)	//codeis원장에 등록

	return shim.Success(nil)
}

func (s *SmartContract)  getComment(APIstub shim.ChaincodeStubInterface ) pb.Response{
	codekeyAsBytes, _ := APIstub.GetState("latestCKey")
	codekey := CodeKey{}
	json.Unmarshal(codekeyAsBytes, &codekey)
	idxStr := strconv.Itoa(codekey.Idx + 1)

	var startKey = "CM0"
	var endKey = codekey.Key + idxStr
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