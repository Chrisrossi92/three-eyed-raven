export type KnowledgeAnswer = {
  title: string;
  body: string;
  certainty: "known" | "unknown";
};

export class KnowledgeService {
  async answerQuestion(question: string): Promise<KnowledgeAnswer> {
    return {
      title: "The memory is not yet written",
      body: `I do not yet hold a trusted answer for: "${question}".`,
      certainty: "unknown"
    };
  }
}
