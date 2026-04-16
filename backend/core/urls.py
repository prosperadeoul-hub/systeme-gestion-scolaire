# core/urls.py
from django.urls import path
from .views import StudentDashboardStats, TeacherGradesView

urlpatterns = [
    path('student/dashboard-stats/', StudentDashboardStats.as_view(), name='student-stats'),
    path('teacher/exams/<int:exam_id>/grades/', TeacherGradesView.as_view(), name='teacher-grades'),
    path('teacher/exams/<int:exam_id>/bulk-save/', TeacherGradesView.as_view(), name='teacher-bulk-save'),
]