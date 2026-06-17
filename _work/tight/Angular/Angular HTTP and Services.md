# Angular HTTP and Services

## Questions Covered

1. What are Angular services, and how do you share data between components using services?
2. What is dependency injection in Angular, and how does it work?
3. How do you make HTTP requests in Angular?
4. Explain how you handle HTTP errors in Angular.
5. What is HttpInterceptor, and how is it used?

## What are Angular services, and how do you share data between components using services?

Angular **services** are classes — decorated with `@Injectable` so they can be injected via Angular's DI system — that encapsulate business logic, manage data, and enable code reuse across components, other services, and directives.

**Creating a service** with the CLI (`ng generate service myService`) and a simple implementation:

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // available application-wide
})
export class MyService {
  private data: string = 'Initial data';
  getData(): string {
    return this.data;
  }
  setData(newData: string): void {
    this.data = newData;
  }
}
```

**Sharing data between components:** hold the data in a service and expose it as an observable (commonly an RxJS `BehaviorSubject`) so components can subscribe to changes.

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private dataSubject = new BehaviorSubject<string>('Initial data');
  data$ = this.dataSubject.asObservable();
  setData(newData: string): void {
    this.dataSubject.next(newData);
  }
}
```

Inject the service into the components that produce and consume the data. **Component A** updates it:

```typescript
import { Component } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-component-a',
  templateUrl: './component-a.component.html'
})
export class ComponentA {
  constructor(private dataService: DataService) {}
  updateData(): void {
    this.dataService.setData('Updated data from Component A');
  }
}
```

**Component B** subscribes and reflects changes in its view:

```typescript
import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-component-b',
  templateUrl: './component-b.component.html'
})
export class ComponentB implements OnInit {
  data: string;
  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.dataService.data$.subscribe(data => {
      this.data = data;
    });
  }
}
```

```html
<p>{{ data }}</p>
```

**Key points:** providing the service at root (`providedIn: 'root'`) makes it a **singleton**, so all components share one instance and the same data; DI injects it without manual instantiation; and using an RxJS observable lets components react to async data changes efficiently.

## What is dependency injection in Angular, and how does it work?

**Dependency Injection (DI)** is a design pattern (and core Angular feature) where a class receives its dependencies from an external source rather than creating them itself. This improves modularity, testability, and maintainability.

**How it works:**

- **DI framework** — Angular maintains an injector that stores and provides instances of services and other dependencies.
- **Providers** — configure how dependencies are created; declared in the `providers` array of a module or component.

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { MyService } from './my-service.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [MyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

- **Injectable services** — decorated with `@Injectable` so Angular can create and inject them.

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MyService {
  getData(): string {
    return 'Hello from MyService!';
  }
}
```

- **Injection tokens** — for non-class dependencies like config values or multiple implementations of an interface.

```typescript
import { InjectionToken } from '@angular/core';
export const API_URL = new InjectionToken<string>('apiUrl');
```

```typescript
// providing the token
@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' }
  ]
})
export class AppModule { }
```

```typescript
// injecting the token
import { Inject, Component } from '@angular/core';
import { API_URL } from './api-url.token';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(@Inject(API_URL) private apiUrl: string) {
    console.log('API URL:', apiUrl);
  }
}
```

**Key concepts:**

- **Constructor injection** — dependencies are declared in the constructor and resolved by Angular when the class is instantiated.

```typescript
import { Component } from '@angular/core';
import { MyService } from './my-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(private myService: MyService) {
    console.log(this.myService.getData());
  }
}
```

- **Provider scope** — application-wide (`providedIn: 'root'`), module-specific (a module's `providers`), or component-specific (a component's `providers`, creating a new instance for it and its children).
- **Hierarchical injection** — each module and component has its own injector, so dependencies resolve at different levels of the hierarchy.

**Benefits:** decoupling (easy to swap or mock dependencies), testability (mock/stub for unit tests), and maintainability (dependencies managed centrally and shared).

## How do you make HTTP requests in Angular?

HTTP requests use `HttpClient` from `@angular/common/http`, which provides a clean API for GET, POST, PUT, DELETE, and more.

**1. Import `HttpClientModule`** in your app module so the `HttpClient` service is available:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MyService } from './my-service.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [MyService],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**2. Inject `HttpClient` into a service** (keeping HTTP logic out of components):

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MyService {
  private apiUrl = 'https://api.example.com/data';

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
  postData(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
  updateData(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }
  deleteData(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

**3. Use the service in a component** by subscribing to its methods:

```typescript
import { Component, OnInit } from '@angular/core';
import { MyService } from './my-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  data: any;
  constructor(private myService: MyService) { }
  ngOnInit(): void {
    this.getData();
  }
  getData(): void {
    this.myService.getData().subscribe(
      response => {
        this.data = response;
        console.log(this.data);
      },
      error => {
        console.error('Error fetching data', error);
      }
    );
  }
  postData(): void {
    const newData = { name: 'New Item' };
    this.myService.postData(newData).subscribe(
      response => console.log('Data posted successfully', response),
      error => console.error('Error posting data', error)
    );
  }
}
```

**Key points:** `HttpClient` exposes `get()`, `post()`, `put()`, `delete()`, `patch()`, etc.; its methods return **observables** you subscribe to; always handle errors (via the error callback or the `catchError` operator); and replace placeholder URLs with real endpoints.

## Explain how you handle HTTP errors in Angular.

HTTP errors are typically handled with `HttpClient` and the RxJS `catchError` operator, which intercepts errors in the response stream so you can react to them.

**1. Using `catchError`** to centralize handling in a service:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://api.example.com/data';
  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```

**2. Client-side vs server-side errors** — client-side/network errors surface as an `ErrorEvent` (detected via `error.error instanceof ErrorEvent`); server-side errors (404, 500, etc.) are identified by the `HttpErrorResponse` status code.

**3. Displaying error messages** — subscribe in the component and show the returned message in the UI:

```typescript
import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-data',
  template: `
    <div *ngIf="errorMessage">{{ errorMessage }}</div>
    <div *ngIf="data">{{ data | json }}</div>
  `
})
export class DataComponent implements OnInit {
  data: any;
  errorMessage: string = '';
  constructor(private apiService: ApiService) { }
  ngOnInit(): void {
    this.apiService.getData().subscribe({
      next: (response) => this.data = response,
      error: (error) => this.errorMessage = error.message
    });
  }
}
```

**4. Global error handling** — use an `HttpInterceptor` to catch errors across all requests in one place:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Client-side error: ${error.error.message}`;
        } else {
          errorMessage = `Server-side error: ${error.status} - ${error.message}`;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
```

**Key points:** use `catchError` to handle errors in the stream, distinguish client- from server-side errors, propagate with `throwError`, and use interceptors for global handling.

## What is HttpInterceptor, and how is it used?

An **`HttpInterceptor`** intercepts and modifies outgoing HTTP requests and incoming responses. It's part of the `HttpClient` module and is commonly used to add auth tokens, log traffic, handle errors globally, cache, or add custom headers — all centrally, before a request is sent or after a response arrives.

**Common use cases:** adding authentication tokens (e.g., JWT), logging, global error handling, caching, and custom headers.

**Implementing an interceptor** — implement the `HttpInterceptor` interface, then register it. This example adds an `Authorization` header and logs errors:

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer my-token`
      }
    });
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          errorMsg = `Client-side error: ${error.error.message}`;
        } else {
          errorMsg = `Server-side error: ${error.status} - ${error.message}`;
        }
        console.error(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
```

**Registering the interceptor** in the app module via the `HTTP_INTERCEPTORS` token:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true // allows multiple interceptors
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

**Key concepts:**

- **`intercept()`** takes the outgoing `HttpRequest` and an `HttpHandler` (the next step in the pipeline) and returns an `Observable<HttpEvent<any>>`, so you can transform requests and the response stream.
- **`req.clone()`** — requests are immutable, so clone the request to modify it (headers, URL, etc.).
- **Global error handling** — handle errors centrally inside `intercept`, reducing per-service/component error code.

**Use-case snippets** — adding a token, logging, and retrying:

```typescript
// add an authentication token
const authReq = req.clone({
  setHeaders: {
    Authorization: `Bearer ${authToken}`
  }
});
```

```typescript
// log requests
console.log('Request:', req.url);
return next.handle(req);
```

```typescript
// retry a failed request
import { retry } from 'rxjs/operators';
return next.handle(req).pipe(
  retry(2),
  catchError(this.handleError)
);
```

**Chaining multiple interceptors** — register several with `multi: true`; Angular runs them in the order provided:

```typescript
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true }
]
```

In short, an `HttpInterceptor` modifies all HTTP traffic for cross-cutting concerns (auth, logging, error handling, headers), and multiple interceptors can be chained.
