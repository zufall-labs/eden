package {{package_name}};

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Path("/api/items")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ItemResource {
    
    private final List<Item> items = new ArrayList<>();

    @GET
    public List<Item> listAll() {
        return items;
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") String id) {
        return items.stream()
                .filter(item -> item.id().equals(id))
                .findFirst()
                .map(Response::ok)
                .orElse(Response.status(Response.Status.NOT_FOUND))
                .build();
    }

    @POST
    public Response create(Item item) {
        items.add(item);
        return Response.status(Response.Status.CREATED).entity(item).build();
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") String id) {
        Optional<Item> item = items.stream()
                .filter(i -> i.id().equals(id))
                .findFirst();
        
        if (item.isPresent()) {
            items.remove(item.get());
            return Response.noContent().build();
        }
        
        return Response.status(Response.Status.NOT_FOUND).build();
    }
}