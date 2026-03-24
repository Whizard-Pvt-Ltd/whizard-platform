import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { SkillItem, TaskItem, ControlPointItem } from '../models/wrcf-skills.models';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class WrcfSkillsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffApiUrl}/wrcf`;

  listSkills(ciId: string): Observable<SkillItem[]> {
    return this.http.get<ApiEnvelope<SkillItem[]>>(`${this.base}/skills?ciId=${ciId}`).pipe(map(r => r.data));
  }

  createSkill(data: Omit<SkillItem, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.base}/skills`, data);
  }

  updateSkill(id: string, data: Partial<Omit<SkillItem, 'id' | 'ciId'>>): Observable<void> {
    return this.http.patch<void>(`${this.base}/skills/${id}`, data);
  }

  deleteSkill(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/skills/${id}`);
  }

  listTasks(skillId: string): Observable<TaskItem[]> {
    return this.http.get<ApiEnvelope<TaskItem[]>>(`${this.base}/tasks?skillId=${skillId}`).pipe(map(r => r.data));
  }

  createTask(data: Omit<TaskItem, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.base}/tasks`, data);
  }

  updateTask(id: string, data: Partial<Omit<TaskItem, 'id' | 'skillId'>>): Observable<void> {
    return this.http.patch<void>(`${this.base}/tasks/${id}`, data);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }

  listControlPoints(taskId: string): Observable<ControlPointItem[]> {
    return this.http.get<ApiEnvelope<ControlPointItem[]>>(`${this.base}/control-points?taskId=${taskId}`).pipe(map(r => r.data));
  }

  createControlPoint(data: Omit<ControlPointItem, 'id'>): Observable<void> {
    return this.http.post<void>(`${this.base}/control-points`, data);
  }

  updateControlPoint(id: string, data: Partial<Omit<ControlPointItem, 'id' | 'taskId'>>): Observable<void> {
    return this.http.patch<void>(`${this.base}/control-points/${id}`, data);
  }

  deleteControlPoint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/control-points/${id}`);
  }
}
