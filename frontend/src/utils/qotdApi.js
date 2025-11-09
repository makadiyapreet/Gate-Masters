import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Alert } from "react-bootstrap";

const QOTDCard = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Render options differently depending on question type
  const renderOptions = () => {
    const { question_type, option_a, option_b, option_c, option_d, correct_option, correct_options } = question;

    if (question_type === "numeric") {
      return <p>Please enter a numeric answer (not shown here).</p>; // Input UI can be added if needed
    }

    if (question_type === "multiple") {
      return (
        <ul>
          <li>A. {option_a} {correct_options && correct_options.includes("A") && <b>(Correct)</b>}</li>
          <li>B. {option_b} {correct_options && correct_options.includes("B") && <b>(Correct)</b>}</li>
          <li>C. {option_c} {correct_options && correct_options.includes("C") && <b>(Correct)</b>}</li>
          <li>D. {option_d} {correct_options && correct_options.includes("D") && <b>(Correct)</b>}</li>
        </ul>
      );
    }

    // default to single correct type
    return (
      <ul>
        <li>A. {option_a} {correct_option === "A" && <b>(Correct)</b>}</li>
        <li>B. {option_b} {correct_option === "B" && <b>(Correct)</b>}</li>
        <li>C. {option_c} {correct_option === "C" && <b>(Correct)</b>}</li>
        <li>D. {option_d} {correct_option === "D" && <b>(Correct)</b>}</li>
      </ul>
    );
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>Question of the Day</Card.Title>
        <Card.Text>
          <strong>{question.question}</strong>
        </Card.Text>
        {renderOptions()}
      </Card.Body>
    </Card>
  );
};

export default QOTDCard;
