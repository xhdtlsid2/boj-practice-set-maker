import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import CloseButton from "react-bootstrap/CloseButton";
import { errorMessages } from "../utils/ErrorMessage";
import help from "../images/question-circle.svg";

/**
 * documentation(unofficial): https://solvedac.github.io/unofficial-documentation/#/operations/searchUser
 */
const SOLVEDAC_API_ENDPOINT = "https://solved.ac/api/v3/user/show";

export default function UserExcludeOption({
    excludedUsers,
    setExcludedUsers
}){
    const [inputValue, setInputValue] = useState("");
    const [addingUser, setAddingUser] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isUserAdded, setIsUserAdded] = useState(false);
    const excludedUserListElement = useRef(null);

    useEffect(() => {
        if(isUserAdded)
            excludedUserListElement.current.scrollTop = excludedUserListElement.current.scrollHeight;
    }, [excludedUsers, isUserAdded]);

    async function handleAdd(){
        if(!inputValue) return;
        if(excludedUsers.findIndex(user => user.toLowerCase() === inputValue.toLowerCase()) !== -1){
            setErrorMessage(errorMessages.ERR_USER_ALREADY_EXISTS);
            return;
        }
        setAddingUser(true);
        try{
            const response = await axios.get(`${SOLVEDAC_API_ENDPOINT}?handle=${inputValue}`);
            setErrorMessage("");
            setInputValue("");
            setIsUserAdded(true);
            setExcludedUsers([...excludedUsers, response.data.handle]);
        }
        catch(error){
            if(error.response && error.response.status === 404)
                setErrorMessage(errorMessages.ERR_USER_DOESNT_EXIST);
            else
                setErrorMessage(errorMessages.ERR_FAILED_TO_LOAD);
        }
        finally{
            setAddingUser(false);
        }
    }
    function handleRemove(removedUser){
        setIsUserAdded(false);
        setExcludedUsers(excludedUsers.filter(user => user !== removedUser));
    }

    return (
        <Col>
            <h2>푼 문제 제외하기</h2>
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>목록에 추가한 유저들이 풀지 않은 문제들로 셋을 구성합니다.</Tooltip>}
            >
                <img src={help} alt="도움말" />
            </OverlayTrigger>
            <div id="user-exclude-option-content">
                <div id="user-search-area">
                    <input
                        placeholder="BOJ 아이디"
                        value={inputValue}
                        onChange={e => {
                            setErrorMessage("");
                            setInputValue(e.target.value);
                        }}
                        onKeyUp={e => e.key === "Enter" && !addingUser && handleAdd()}
                    />
                    <Button
                        onClick={() => handleAdd()}
                        disabled={addingUser}
                    >
                        {!addingUser ? "추가" : "추가 중..."}
                    </Button>
                </div>
                {errorMessage !== "" &&
                    <div id="user-exclude-error" className="error">{errorMessage}</div>
                }
                <ListGroup as="ul" id="excluded-user-list" ref={excludedUserListElement}>
                    {excludedUsers.map(user =>
                        <ListGroup.Item as="li" key={user}>
                            <span>{user}</span>
                            <CloseButton
                                onClick={() => handleRemove(user)}
                                aria-label="제거"
                            />
                        </ListGroup.Item>
                    )}
                </ListGroup>
            </div>
        </Col>
    );
}