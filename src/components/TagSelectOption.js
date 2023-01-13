import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Col from "react-bootstrap/Col";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import { errorMessages } from "../utils/ErrorMessage";
import help from "../images/question-circle.svg";
import Search from "../images/search.svg";

/**
 * documentation(unofficial): https://solvedac.github.io/unofficial-documentation/#/operations/searchProblemTag
 */
const SOLVEDAC_API_ENDPOINT = "https://solved.ac/api/v3/search/tag";

function Tag({ tag }){
    const tagName = tag.displayNames.find(({ language }) => language === "ko").name;

    return (
        <div className="tag">
            <span>{tagName}</span>
            <span className="tag-key">{` ${tag.key}`}</span>
        </div>
    );
}

export default function TagSelectOption({
    selectedTags,
    setSelectedTags
}){
    const [inputValue, setInputValue] = useState("");
    const [searchingTag, setSearchingTag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [searchedTags, setSearchedTags] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isTagAdded, setIsTagAdded] = useState(false);
    const triggerSearchInputElement = useRef(null);
    const tagSearchInputElement = useRef(null);
    const selectedTagListElement = useRef(null);

    useEffect(() => {
        if(showModal)
            tagSearchInputElement.current.focus();
    }, [showModal]);
    useEffect(() => {
        if(isTagAdded)
            selectedTagListElement.current.scrollTop = selectedTagListElement.current.scrollHeight;
    }, [selectedTags, isTagAdded]);

    async function handleSearch(){
        if(!inputValue) return;
        setSearchingTag(true);
        try{
            const response = await axios.get(`${SOLVEDAC_API_ENDPOINT}?query=${inputValue}`);
            setSearchedTags(response.data.items);
            if(!response.data.count)
                setErrorMessage(errorMessages.ERR_TAG_DOESNT_EXIST);
        }
        catch(error){
            setSearchedTags([]);
            if(error.response && error.response.status === 400)
                setErrorMessage(errorMessages.ERR_BAD_REQUEST);
            else
                setErrorMessage(errorMessages.ERR_FAILED_TO_LOAD);
        }
        finally{
            setSearchingTag(false);
        }
    }
    function handleAdd(addedTag){
        setIsTagAdded(true);
        setSelectedTags([...selectedTags, addedTag]);
    }
    function handleRemove(removedTag){
        setIsTagAdded(false);
        setSelectedTags(selectedTags.filter(tag => tag !== removedTag));
    }
    function handleOpenModal(){
        triggerSearchInputElement.current.blur();
        setShowModal(true);
    }
    function handleCloseModal(){
        setInputValue("");
        setErrorMessage("");
        setSearchedTags([]);
        setShowModal(false);
    }

    let modalBodyContent;
    if(searchingTag){
        modalBodyContent = (
            <div>검색 중...</div>
        );
    }
    else if(errorMessage !== ""){
        modalBodyContent = (
            <div className="error">{errorMessage}</div>
        );
    }
    else{
        modalBodyContent = (
            <ListGroup as="ul" variant="flush" id="searched-tag-list">
                {searchedTags.map(tag =>
                    <ListGroup.Item as="li" key={tag.key}>
                        <Tag tag={tag} />
                        <Button
                            onClick={() => handleAdd(tag)}
                            disabled={selectedTags.findIndex(({ key }) => key === tag.key) !== -1}
                        >추가</Button>
                    </ListGroup.Item>
                )}
            </ListGroup>
        );
    }

    return (
        <Col>
            <h2>태그 추가하기</h2>
            <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip>목록에 추가한 태그들 중 적어도 하나를 포함하는 문제들로 셋을 구성합니다.</Tooltip>}
            >
                <img src={help} alt="도움말" />
            </OverlayTrigger>
            <input
                id="modal-open-input"
                ref={triggerSearchInputElement}
                placeholder="태그 검색"
                onFocus={() => handleOpenModal()}
            />
            <Modal show={showModal} animation={false} onHide={() => handleCloseModal(false)}>
                <Modal.Header>
                    <img id="tag-search-icon" src={Search} alt="검색" />
                    <input
                        id="tag-search-input"
                        placeholder="Enter 키를 눌러 검색"
                        value={inputValue}
                        onChange={e => {
                            setErrorMessage("");
                            setInputValue(e.target.value)
                        }}
                        onKeyUp={e => e.key === "Enter" && !searchingTag && handleSearch()}
                        ref={tagSearchInputElement}
                        autoComplete="off"
                    />
                </Modal.Header>
                <Modal.Body>{modalBodyContent}</Modal.Body>
            </Modal>
            <ListGroup as="ul" id="selected-tag-list" ref={selectedTagListElement}>
                {selectedTags.map(tag =>
                    <ListGroup.Item as="li" key={tag.key}>
                        <Tag tag={tag} />
                        <CloseButton
                            onClick={() => handleRemove(tag)}
                            aria-label="제거"
                        />
                    </ListGroup.Item>    
                )}
            </ListGroup>
        </Col>
    );
}