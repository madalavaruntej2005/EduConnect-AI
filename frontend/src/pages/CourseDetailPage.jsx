import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  CheckCircle,
  HelpCircle,
  FileText,
  Clock,
  ArrowLeft,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${id}/`);
      setCourse(res.data);
      if (res.data.lessons && res.data.lessons.length > 0) {
        setActiveLesson(res.data.lessons[0]);
      }

      // Fetch quizzes
      const quizRes = await api.get(`/courses/${id}/quizzes/`);
      setQuizzes(quizRes.data || []);
    } catch (err) {
      console.error('Failed to load course details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${id}/enroll/`);
      fetchCourseData();
    } catch (err) {
      console.error('Failed to enroll:', err);
    }
  };

  const handleCompleteLesson = async (lessonId) => {
    try {
      await api.post(`/courses/${id}/complete_lesson/`, { lesson_id: lessonId });
      setCompletedLessons((prev) => new Set(prev).add(lessonId));
      fetchCourseData();
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleSelectOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correct_index) {
        correct++;
      }
    });
    const percentage = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-sm text-slate-500">
        Loading interactive lesson player...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-sm text-slate-500">
        Course not found. <Link to="/learning" className="text-indigo-600 underline">Return to catalog</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button & Breadcrumb */}
      <Link to="/learning" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Course Library
      </Link>

      {/* Main Player & Lesson Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player, Lesson Content, Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Box */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
            {activeLesson?.video_url ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeLesson.video_url.split('v=')[1] || 'dQw4w9WgXcQ'}`}
                title={activeLesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Play className="w-12 h-12 text-indigo-400 mx-auto opacity-70" />
                <p className="text-sm font-semibold text-white">Select a lesson to begin playback</p>
              </div>
            )}
          </div>

          {/* Lesson Header & Mark Complete */}
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Badge variant="primary" size="sm">
                Lesson {activeLesson?.order || 1}
              </Badge>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                {activeLesson?.title || course.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.round((activeLesson?.duration_seconds || 600) / 60)} minutes
              </p>
            </div>

            {user && (
              <Button
                variant={completedLessons.has(activeLesson?.id) ? 'outline' : 'primary'}
                size="sm"
                icon={CheckCircle}
                onClick={() => handleCompleteLesson(activeLesson?.id)}
              >
                {completedLessons.has(activeLesson?.id) ? 'Completed' : 'Mark Lesson Complete'}
              </Button>
            )}
          </Card>

          {/* Study Notes & Markdown Material */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Lesson Study Notes & Summary
            </h3>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              {activeLesson?.notes_markdown || 'No supplementary markdown notes attached to this lesson.'}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Lessons Checklist & Quizzes */}
        <div className="space-y-4">
          {/* Enroll Card if not enrolled */}
          {!course.is_enrolled && user && (
            <Card className="bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 border-indigo-200 dark:border-indigo-800 text-center space-y-3 p-5">
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Enroll for Free</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Track completion progress, earn verified badge, and test your knowledge.
              </p>
              <Button variant="primary" size="sm" onClick={handleEnroll} className="w-full font-bold">
                Enroll Now
              </Button>
            </Card>
          )}

          {/* Lessons List */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Course Syllabus ({course.lessons?.length || 0})
              </h4>
              {course.my_progress !== undefined && (
                <span className="text-xs font-bold text-emerald-600">{course.my_progress}%</span>
              )}
            </div>

            <div className="space-y-1.5">
              {course.lessons?.map((lesson, idx) => {
                const isSelected = activeLesson?.id === lesson.id;
                const isDone = completedLessons.has(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-bold shadow-sm'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="opacity-75">{idx + 1}.</span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {isDone && <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Course Quizzes */}
          {quizzes.length > 0 && (
            <Card className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Practice Quizzes
              </h4>

              <div className="space-y-2">
                {quizzes.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleStartQuiz(q)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 text-left transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{q.title}</p>
                      <p className="text-[10px] text-slate-400">{q.questions?.length || 0} Questions • Pass score {q.passing_score}%</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Interactive Quiz Modal */}
      {activeQuiz && (
        <Modal
          isOpen={!!activeQuiz}
          onClose={() => setActiveQuiz(null)}
          title={`Quiz: ${activeQuiz.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {activeQuiz.questions.map((q, qIdx) => (
              <div key={q.id} className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {qIdx + 1}. {q.text}
                </p>

                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    let style = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-indigo-500';

                    if (quizSubmitted) {
                      if (optIdx === q.correct_index) {
                        style = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
                      } else if (isSelected) {
                        style = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200';
                      }
                    } else if (isSelected) {
                      style = 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${style}`}
                      >
                        {String.fromCharCode(65 + optIdx)}) {opt}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && q.explanation && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-900">
                    💡 <span className="font-semibold">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {quizSubmitted ? (
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
                <h4 className="text-base font-extrabold text-indigo-700 dark:text-indigo-300">
                  You Scored: {quizScore}%
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {quizScore >= activeQuiz.passing_score
                    ? '🎉 Passed! Excellent demonstration of subject mastery.'
                    : 'Review the lessons and retry to improve your score.'}
                </p>
                <Button variant="primary" size="sm" onClick={() => setActiveQuiz(null)}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={() => setActiveQuiz(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length < activeQuiz.questions.length}
                >
                  Submit Answers
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
