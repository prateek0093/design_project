import {useState, useEffect, useCallback, useLayoutEffect} from "react";
import { Menu, X, BookOpen, Clock, ChevronRight, FileText, ListChecks,ClipboardX } from "lucide-react";
import { useCookies } from "react-cookie";
import React from "react";
import { Link, useNavigate,useLocation } from "react-router-dom";
import Header from "./header.jsx";

const Dashboard = () => {
    const location = useLocation();
    const { username } = location.state || {};
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allAssignmentsError, setAllAssignmentsError] = useState(null);
    const [submittedAssignmentsError, setSubmittedAssignmentsError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        enrolledCourses: [],
        recentTasks: [],
        submittedAssignments: { assignments: [] },
        allAssignments: { assignments: [] },
    });
    const [specificLoading, setSpecificLoading] = useState(false);
    const [activeItem, setActiveItem] = useState("Dashboard");

    const [cookies] = useCookies(["accessToken"]);
    const navigate = useNavigate();
    const [popupData, setPopupData] = useState(null);
    useEffect(() => {
        if (!cookies.accessToken) {
            navigate("/login");
        }
    }, [cookies.accessToken, navigate]);

    const fetchStudentDashboard = useCallback(async () => {
        try {
            const response = await fetch(
                import.meta.env.VITE_BE_URL + "/verified/student/dashboard",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${cookies.accessToken}`,
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const data = await response.json();
            setDashboardData(prev => ({
                ...prev,
                enrolledCourses: data.enrolledCourses || [],
                recentTasks: data.recentTasks || [],
            }));
            setLoading(false);
        } catch (error) {
            setError("Error fetching dashboard data");
            setLoading(false);
        }
    }, [cookies.accessToken]);

    const fetchSpecificAssignments = useCallback(async (type) => {
        try {
            setSpecificLoading(true);

            const endpoint =
                type === "All Assignments"
                    ? import.meta.env.VITE_BE_URL + "/verified/student/all-assignments"
                    : import.meta.env.VITE_BE_URL + "/verified/student/submitted-assignments";

            const response = await fetch(endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${cookies.accessToken}`,
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
            }

            const data = await response.json();

            setDashboardData(prev => ({
                ...prev,
                [type === "All Assignments" ? "allAssignments" : "submittedAssignments"]: data
            }));

            if (type === "All Assignments") setAllAssignmentsError(null);
            if (type === "Submitted Assignments") setSubmittedAssignmentsError(null);
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);

            if (type === "All Assignments") {
                setAllAssignmentsError("Failed to fetch all assignments.");
            }
            if (type === "Submitted Assignments") {
                setSubmittedAssignmentsError("Failed to fetch submitted assignments.");
            }
        } finally {
            setSpecificLoading(false);
        }
    }, [cookies.accessToken]);

    useEffect(() => {
        if (cookies.accessToken) {
            fetchStudentDashboard();
        }
    }, [cookies.accessToken, fetchStudentDashboard]);

    useEffect(() => {
        if (activeItem === "All Assignments" || activeItem === "Submitted Assignments") {
            fetchSpecificAssignments(activeItem);
        }
    }, [activeItem, fetchSpecificAssignments]);

    const navItems = [
        { text: "Dashboard", icon: <BookOpen /> },
        { text: "All Assignments", icon: <ListChecks /> },
        { text: "Submitted Assignments", icon: <FileText /> },
    ];
    const handleTaskClickSubmitted = (assignment) => {
        setPopupData({
            assignmentName: assignment.assignmentName,
            marks: assignment.scoredMarks,
        });
    };
    const handleCourseClick = (courseCode) => {
        navigate(`/enrolled/${courseCode}`);
    };

    const handleTaskClick = (courseCode, assignmentId) => {
        navigate(`/enrolled/${courseCode}/${assignmentId}`);
    };

    const handleTaskClick1 = (courseCode, assignmentId, isSubmitted) => {
        if(isSubmitted)
            alert("Assignment is submitted");
        else
            navigate(`/enrolled/${courseCode}/${assignmentId}`);
    };

    if (loading || error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className={`text-${error ? "red" : "purple"}-600 flex flex-col items-center gap-4`}>
                    {error ? (
                        <>
                            <div className="text-xl font-semibold">{error}</div>
                            <button
                                onClick={fetchStudentDashboard}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Retry
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            <div className="text-lg">Loading dashboard...</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeItem) {
            case "Dashboard":
                return (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Enrolled Courses Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Enrolled Courses
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.enrolledCourses.length > 0 ? (
                                    dashboardData.enrolledCourses.map((course, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleCourseClick(course.courseCode)}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                                        >
                                            <div>
                                                <h3 className="font-medium text-gray-800">
                                                    {course.courseName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {course.courseCode}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No courses enrolled yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Tasks Section */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-6 h-6 text-purple-600" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Recent Tasks
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {dashboardData.recentTasks.length > 0 ? (
                                    dashboardData.recentTasks.map((task, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleTaskClick(task.courseCode, task.assignmentId)}
                                            className="flex flex-col p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                                    {task.assignmentName}
                                                </h3>
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-sm text-gray-500">
                                                    {task.courseCode}
                                                </span>
                                                <span className="text-sm text-gray-400">•</span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(task.startTime).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No recent tasks yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case "All Assignments":
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <ListChecks className="w-6 h-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-800">All Assignments</h2>
                        </div>
                        {allAssignmentsError ? (
                            <div className="text-red-500 text-center py-8">
                                {allAssignmentsError}
                            </div>
                        ) : specificLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : dashboardData.allAssignments?.assignments?.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardData.allAssignments.assignments.map((assignment, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTaskClick1(assignment.courseCode, assignment.assignmentId, assignment.isSubmitted)}
                                        className="flex flex-col p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                                {assignment.assignmentName}
                                            </h3>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-500">{assignment.courseName}</span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-500">
                                                Start: {assignment.startTime.split("T")[0]}{" "}
                                                {assignment.startTime.split("T")[1].slice(0, 5)}
                                            </span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-500">
                                                Start: {assignment.endTime.split("T")[0]}{" "}
                                                {assignment.endTime.split("T")[1].slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <ClipboardX className="w-16 h-16 mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">No Assignments Found</h3>
                                <p className="text-center text-sm">
                                    There are currently no assignments available for your courses.
                                </p>
                            </div>
                        )}
                    </div>
                );


            case "Submitted Assignments":
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-6 h-6 text-purple-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Submitted Assignments</h2>
                        </div>
                        {submittedAssignmentsError ? (
                            <div className="text-red-500 text-center py-8">
                                {submittedAssignmentsError}
                            </div>
                        ) : specificLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : dashboardData.submittedAssignments?.assignments?.length > 0 ? (
                            <div className="space-y-3">
                                {dashboardData.submittedAssignments.assignments.map((assignment, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleTaskClickSubmitted(assignment)}
                                        className="flex flex-col p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                                {assignment.assignmentName}
                                            </h3>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-gray-500">{assignment.courseName}</span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-500">
                                                Submitted: {assignment.gradedTime.split("T")[0]}{" "}
                                                {assignment.gradedTime.split("T")[1].slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <ClipboardX className="w-16 h-16 mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium mb-2">No Submitted Assignments</h3>
                                <p className="text-center text-sm">
                                    You haven't submitted any assignments yet.
                                </p>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };
    const closePopup = () => {
        setPopupData(null);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header />
            <div className="flex flex-grow">
                {/* Sidebar */}
                <div
                    className={`${
                        isSidebarOpen ? "w-64" : "w-20"
                    } bg-white transition-all duration-300 shadow-lg hidden md:block relative`}
                >

                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-3 top-9 bg-purple-600 rounded-full p-1.5 text-white hover:bg-purple-700 transition-colors"
                    >
                        {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                    </button>

                    <div className="mt-10 space-y-2 px-3">
                        {navItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`${
                                    activeItem === item.text
                                        ? "bg-purple-100 text-purple-600"
                                        : "text-gray-600 hover:bg-purple-50"
                                } flex items-center p-3 space-x-3 rounded-lg cursor-pointer transition-colors duration-200`}
                                onClick={() => setActiveItem(item.text)}
                            >
                                {item.icon}
                                {isSidebarOpen && (
                                    <span className="font-medium truncate">{item.text}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-grow p-8 overflow-y-auto min-w-0">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-800 mb-8">
                            {activeItem}
                        </h1><h2 className="p-4 text-2xl">Hello, {username}!</h2>

                        {renderContent()}
                    </div>
                </div>
            </div>
            {popupData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignment Details</h2>
                        <p className="text-gray-700 mb-2">
                            <strong>Assignment Name:</strong> {popupData.assignmentName}
                        </p>
                        <p className="text-gray-700 mb-4">
                            <strong>Marks:</strong> {popupData.marks}
                        </p>
                        <button
                            onClick={closePopup}
                            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;