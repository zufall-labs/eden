import {{project_name}}/web
import gleam/http.{Delete, Get, Patch, Post}
import gleam/json
import wisp.{type Request, type Response}

pub fn handle_request(req: Request) -> Response {
  use req <- web.middleware(req)

  case wisp.path_segments(req) {
    // This matches `/`
    [] -> apex(req)

    // This matches `/users`
    ["users"] -> handle_users(req)

    // This matches `/users/:id`
    ["users", id] -> handle_user(req, id)

    // This matches everything else
    _ -> wisp.not_found()
  }
}

fn apex(req: Request) -> Response {
  use <- wisp.require_method(req, Get)

  wisp.json_response(
    json.to_string_builder(json.object([#("health", json.string("ok"))])),
    200,
  )
}

fn handle_users(req: Request) -> Response {
  case req.method {
    Get -> list_users()
    Post -> create_user(req)

    _ -> wisp.method_not_allowed([Get, Post, Patch, Delete])
  }
}

fn handle_user(req: Request, id: String) -> Response {
  case req.method {
    Get -> read_user(req, id)

    _ -> wisp.method_not_allowed([Get, Post, Patch, Delete])
  }
}

fn list_users() -> Response {
  let data = [
    json.object([#("id", json.int(1)), #("name", json.string("foo"))]),
    json.object([#("id", json.int(2)), #("name", json.string("bar"))]),
  ]

  wisp.json_response(
    json.to_string_builder(json.array(from: data, of: fn(x: json.Json) { x })),
    200,
  )
}

fn create_user(req: Request) -> Response {
  use json <- wisp.require_json(req)

  wisp.json_response(
    json.to_string_builder(
      json.object([#("status", json.string("User Created Mock"))]),
    ),
    200,
  )
}

fn read_user(_req: Request, id: String) -> Response {
  wisp.json_response(
    json.to_string_builder(json.object([#("foo", json.string(id))])),
    200,
  )
}
