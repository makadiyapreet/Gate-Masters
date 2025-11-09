import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert, Badge, Button, Form } from "react-bootstrap";

const QOTDCard = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);       // Array for MSQ, string for MCQ/Numeric
  const [numericAnswer, setNumericAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQOTD = async () => {
      try {
        const response = await axios.get("http://localhost:8091/get_qotd.php");
        if (response.data && !response.data.error) {
          setQuestion(response.data);
        } else {
          setError("No question found.");
        }
      } catch (err) {
        setError("Failed to load Question of the Day.");
      } finally {
        setLoading(false);
      }
    };
    fetchQOTD();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading Question of the Day...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="shadow-sm">
        {error}
      </Alert>
    );
  }

  const handleOptionChange = (key) => {
    if (question.question_type === "multiple") {
      // Toggle option
      setSelected(prev =>
        prev.includes(key)
          ? prev.filter(opt => opt !== key)
          : [...prev, key]
      );
    } else {
      // Single
      setSelected([key]);
    }
  };

  const handleNumericChange = (e) => {
    setNumericAnswer(e.target.value);
  };

  const handleSubmit = () => {
    let isCorrect = false, feedbackMsg = "";
    setSubmitted(true);

    if (question.question_type === "multiple") {
      // Sort for comparison
      const selectedSorted = [...selected].sort().join("");
      const correctSorted = [...question.correct_options].sort().join("");
      isCorrect = (selectedSorted === correctSorted);

      if (isCorrect) {
        feedbackMsg = "Correct!";
      } else {
        feedbackMsg = `Incorrect! Correct answers: ${question.correct_options.join(', ')}`;
      }
    }
    else if (question.question_type === "numeric") {
      let numCorr = String(question.correct_option).trim();
      if (numericAnswer.trim() === numCorr) {
        feedbackMsg = "Correct!";
        isCorrect = true;
      } else {
        feedbackMsg = `Incorrect! Correct answer: ${numCorr}`;
      }
    }
    else {
      // Single correct
      if (selected[0] === question.correct_option) {
        feedbackMsg = "Correct!";
        isCorrect = true;
      } else {
        const corrKey = question.correct_option;
        feedbackMsg = `Incorrect! Correct answer: ${corrKey}. ${question['option_' + corrKey.toLowerCase()]}`;
      }
    }
    setFeedback(feedbackMsg);
  };

  // Options rendering
  const options = [
    { key: "A", value: question.option_a },
    { key: "B", value: question.option_b },
    { key: "C", value: question.option_c },
    { key: "D", value: question.option_d },
  ].filter(opt => opt.value);

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>
          Question of the Day{" "}
          {question.subject && <Badge bg="info" className="ms-2">{question.subject}</Badge>}
        </Card.Title>
        <Card.Text>
          <strong>{question.question}</strong>
        </Card.Text>
        <Form>
          {question.question_type === "numeric" ? (
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Enter your answer"
                value={numericAnswer}
                onChange={handleNumericChange}
                disabled={submitted}
              />
            </Form.Group>
          ) : (
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {options.map(opt => (
                <li key={opt.key} style={{ marginBottom: "10px" }}>
                  {question.question_type === "multiple" ? (
                    <Form.Check
                      inline
                      label={`${opt.key}. ${opt.value}`}
                      type="checkbox"
                      checked={selected.includes(opt.key)}
                      onChange={() => handleOptionChange(opt.key)}
                      disabled={submitted}
                    />
                  ) : (
                    <Form.Check
                      inline
                      label={`${opt.key}. ${opt.value}`}
                      type="radio"
                      name="mcq"
                      checked={selected[0] === opt.key}
                      onChange={() => handleOptionChange(opt.key)}
                      disabled={submitted}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
          <Button
            onClick={handleSubmit}
            className="mt-2"
            disabled={
              submitted ||
              (question.question_type === "numeric"
                ? !numericAnswer.trim()
                : selected.length === 0)
            }
          >
            Submit
          </Button>
        </Form>
        {feedback && (
          <Alert variant={feedback.startsWith("Correct") ? "success" : "danger"} className="mt-3">
            {feedback}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default QOTDCard;
