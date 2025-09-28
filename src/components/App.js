import { useState } from "react";
import axios from "axios";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import ProblemOption from "./ProblemOption";
import UserExcludeOption from "./UserExcludeOption";
import TagSelectOption from "./TagSelectOption";
import ProblemSet from "./ProblemSet";
import { tierName } from "../utils/TierName";
import { errorMessages } from "../utils/ErrorMessage";
import leftBrace from "../images/left-brace.svg";
import rightBrace from "../images/right-brace.svg";
import error from "../images/exclamation-triangle-fill.svg";
import link from "../images/box-arrow-up-right.svg";

/**
 * documentation(unofficial): https://solvedac.github.io/unofficial-documentation/#/operations/searchProblem
 */
const PROXY_API_ENDPOINT = "https://boj-practice.meethub.app";
const MAX_PROBLEMSET_SIZE = 26;

export default function App() {
  const [problemOption, setProblemOption] = useState(() =>
    Array(6)
      .fill(null)
      .map(() => ({
        isDetail: false,
        count: Array(6).fill(""),
      }))
  );
  const [excludedUsers, setExcludedUsers] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [makingProblemSet, setMakingProblemSet] = useState(false);
  const [errorMessageList, setErrorMessageList] = useState([]);
  const [problemSet, setProblemSet] = useState([]);
  const [problemSetId, setProblemSetId] = useState(0);

  function updateProblemSet(newProblemSet) {
    setProblemSetId(problemSetId + 1);
    setProblemSet(newProblemSet);
  }
  async function makeProblemSet() {
    const selectedProblems = extractSelectedProblems(problemOption);
    const problemSetSize = selectedProblems.reduce(
      (sum, { count }) => sum + Number(count),
      0
    );
    if (!problemSetSize || problemSetSize > MAX_PROBLEMSET_SIZE) {
      setErrorMessageList([errorMessages.ERR_INVALID_PROBLEMSET_SIZE]);
      return;
    }
    setMakingProblemSet(true);
    const userExcludeQuery = excludedUsers
      .map((user) => "-s%40" + user)
      .join("%20");
    const tagSelectQuery = selectedTags
      .map((tag) => "%23" + tag.key)
      .join("%7C");
    try {
      const responses = await Promise.all(
        selectedProblems.map(({ tierIndex }) => {
          const optionIndex = Math.floor(tierIndex / 6);
          const subIndex = tierIndex % 6;
          const problemQuery = `*${"bsgpdr"[optionIndex]}${
            subIndex ? "54321"[subIndex - 1] : ""
          }`;
          const query = `${problemQuery}%20${userExcludeQuery}(${tagSelectQuery})`;
          return axios.get(`${PROXY_API_ENDPOINT}?query=${query}&sort=random`);
        })
      );
      const [newProblemSet, insufficientProblems] = tryMakingProblemset(
        selectedProblems,
        responses
      );
      if (insufficientProblems.length)
        setErrorMessageList(insufficientProblems);
      else {
        newProblemSet.sort((a, b) => a.level - b.level);
        updateProblemSet(newProblemSet);
        setErrorMessageList([]);
      }
    } catch (error) {
      if (error.response && error.response.status === 400)
        setErrorMessageList([errorMessages.ERR_BAD_REQUEST]);
      else setErrorMessageList([errorMessages.ERR_FAILED_TO_LOAD]);
    } finally {
      setMakingProblemSet(false);
    }
  }

  return (
    <>
      <header>
        <img src={leftBrace} alt="왼쪽 중괄호" />
        <h1>BOJ 그룹 연습 셋 만들기</h1>
        <img src={rightBrace} alt="오른쪽 중괄호" />
      </header>
      <Container>
        <Row>
          <ProblemOption
            problemOption={problemOption}
            setProblemOption={setProblemOption}
          />
          <Col className="option-seperator" />
          <UserExcludeOption
            excludedUsers={excludedUsers}
            setExcludedUsers={setExcludedUsers}
          />
          <Col className="option-seperator" />
          <TagSelectOption
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
          />
        </Row>
        <Row>
          <Button
            id="problem-set-make-button"
            onClick={() => makeProblemSet()}
            disabled={makingProblemSet}
          >
            {!makingProblemSet ? "셋 만들기" : "만드는 중..."}
          </Button>
        </Row>
        {errorMessageList.length > 0 && (
          <Row>
            <ul id="problem-set-make-error-list" className="error">
              {errorMessageList.map((message) => (
                <li key={message}>
                  <img src={error} alt="에러" />
                  {message}
                </li>
              ))}
            </ul>
          </Row>
        )}
        {problemSet.length > 0 && (
          <>
            <ProblemSet
              key={problemSetId}
              problemSet={problemSet}
              updateProblemSet={updateProblemSet}
            />
            <Row>
              <a
                id="chrome-extension-link"
                href="https://chrome.google.com/webstore/detail/boj-practice-problem-adde/dinlcpopclnciiadkcmffaglelfliohm"
                target="_black"
                rel="noreferrer"
              >
                Chrome 확장 프로그램으로 간편하게 연습에 문제 추가하기
                <img src={link} alt="링크" />
              </a>
            </Row>
            <div id="problem-set-comma-separated-list">
              {problemSet.map(({ problemId }) => problemId).join(",")}
            </div>
          </>
        )}
      </Container>
    </>
  );
}

function extractSelectedProblems(problemOption) {
  const selectedProblems = [];
  for (let optionIndex = 0; optionIndex < 6; optionIndex++) {
    const { isDetail, count } = problemOption[optionIndex];
    for (let subIndex = 0; subIndex < 6; subIndex++) {
      if (
        (isDetail && !subIndex) ||
        (!isDetail && subIndex) ||
        !Number(count[subIndex])
      )
        continue;
      selectedProblems.push({
        tierIndex: optionIndex * 6 + subIndex,
        count: count[subIndex],
      });
    }
  }
  return selectedProblems;
}

function tryMakingProblemset(selectedProblems, responses) {
  const problemSet = [];
  const insufficientProblems = [];
  for (let i = 0; i < selectedProblems.length; i++) {
    const { tierIndex, count } = selectedProblems[i];
    if (count > responses[i].data.items.length) {
      insufficientProblems.push(
        errorMessages.ERR_INSUFFICIENT_PROBLEM(
          tierName(tierIndex),
          responses[i].data.items.length
        )
      );
    } else {
      for (const problem of responses[i].data.items.slice(0, count)) {
        problemSet.push(problem);
      }
    }
  }
  return [problemSet, insufficientProblems];
}
